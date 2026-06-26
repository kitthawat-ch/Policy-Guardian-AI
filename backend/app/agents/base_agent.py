import logging
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

class BaseAgent:
    """Base class for all agents in the ADK."""
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        if not settings.GEMINI_API_KEY:
            logger.warning(f"GEMINI_API_KEY is missing. {self.name} will run in mock fallback mode.")

    @property
    def model(self):
        if not settings.GEMINI_API_KEY: return None
        genai.configure(api_key=settings.GEMINI_API_KEY)
        return genai.GenerativeModel(settings.GEMINI_MODEL)

    @property
    def flash_model(self):
        if not settings.GEMINI_API_KEY: return None
        genai.configure(api_key=settings.GEMINI_API_KEY)
        return genai.GenerativeModel(settings.GEMINI_MODEL)

    def _is_quota_error(self, e: Exception) -> bool:
        err_str = str(e).lower()
        return "429" in err_str or "quota" in err_str or "rate limit" in err_str or "exhausted" in err_str

    def _save_llm_log(self, prompt: str, response: str):
        try:
            from app.core.database import SessionLocal
            from app.models.llm_log import LlmLog
            db = SessionLocal()
            try:
                log = LlmLog(agent_name=self.name, prompt=prompt, response=response)
                db.add(log)
                db.commit()
            except Exception as inner_e:
                logger.error(f"[{self.name}] Failed to save LLM log to DB: {inner_e}")
            finally:
                db.close()
        except Exception as e:
            logger.error(f"[{self.name}] Database session error: {e}")

    def call_model(self, prompt: str, use_flash: bool = False, json_mode: bool = False) -> str:
        """Invokes Gemini API with fallback handling."""
        if not self.model:
            raise ValueError(f"Gemini API not configured for {self.name}.")
        
        model = self.flash_model if use_flash else self.model
        
        try:
            generation_config = genai.GenerationConfig(
                response_mime_type="application/json" if json_mode else "text/plain"
            )
            logger.info(f"[{self.name}] Sending prompt to Gemini:\n{'-'*40}\n{prompt}\n{'-'*40}")
            response = model.generate_content(prompt, generation_config=generation_config)
            self._save_llm_log(prompt, response.text)
            return response.text
        except Exception as e:
            logger.error(f"[{self.name}] Gemini API Error: {e}")
            if self._is_quota_error(e):
                raise RuntimeError(
                    "[GEMINI_QUOTA_EXCEEDED] ขณะนี้ระบบเรียกใช้งาน Gemini API เกินโควตาการใช้งานชั่วคราว (429 Quota Exceeded) "
                    "จึงไม่สามารถใช้ AI สรุปคำตอบได้ชั่วคราว กรุณาเว้นระยะเวลาสักครู่ (ประมาณ 30 วินาที) แล้วลองใหม่อีกครั้งนะครับ"
                ) from e
            raise e

    def call_model_stream(self, prompt: str, use_flash: bool = False):
        """Invokes Gemini API with streaming."""
        if not self.model:
            raise ValueError(f"Gemini API not configured for {self.name}.")
        
        model = self.flash_model if use_flash else self.model
        
        try:
            logger.info(f"[{self.name}] Sending streaming prompt to Gemini:\n{'-'*40}\n{prompt}\n{'-'*40}")
            response = model.generate_content(prompt, stream=True)
            full_response = ""
            for chunk in response:
                if chunk.text:
                    full_response += chunk.text
                    yield chunk.text
            self._save_llm_log(prompt, full_response)
        except Exception as e:
            logger.error(f"[{self.name}] Gemini API Error in stream: {e}")
            if self._is_quota_error(e):
                yield "[GEMINI_QUOTA_EXCEEDED] ขณะนี้ระบบเรียกใช้งาน Gemini API เกินโควตา"
            else:
                yield f"[ERROR] {e}"

    def call_model_with_tools(self, prompt: str, tools: list, use_flash: bool = False):
        """Invokes Gemini API with function calling capabilities."""
        if not self.model:
            raise ValueError(f"Gemini API not configured for {self.name}.")
        
        model = self.flash_model if use_flash else self.model
        
        try:
            logger.info(f"[{self.name}] Sending tools prompt to Gemini:\n{'-'*40}\n{prompt}\n{'-'*40}")
            response = model.generate_content(prompt, tools=tools)
            if response.candidates and response.candidates[0].content.parts:
                part = response.candidates[0].content.parts[0]
                if part.function_call:
                    resp_text = f"Function Call: {part.function_call.name}({dict(part.function_call.args)})"
                    self._save_llm_log(prompt, resp_text)
                    return {
                        "type": "function_call",
                        "name": part.function_call.name,
                        "args": dict(part.function_call.args)
                    }
                else:
                    self._save_llm_log(prompt, part.text)
                    return {
                        "type": "text",
                        "text": part.text
                    }
            self._save_llm_log(prompt, response.text)
            return {"type": "text", "text": response.text}
        except Exception as e:
            logger.error(f"[{self.name}] Gemini API Error: {e}")
            if self._is_quota_error(e):
                raise RuntimeError("[GEMINI_QUOTA_EXCEEDED]") from e
            raise e

    def load_skill(self, skill_name: str) -> str:
        """
        Dynamically loads a skill from the .agents/skills directory.
        Returns the content of the SKILL.md file if found, otherwise an empty string.
        """
        import os
        # Find project root by going up from backend/app/agents
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(current_dir, "../../../"))
        skill_path = os.path.join(project_root, ".agents", "skills", skill_name, "SKILL.md")
        
        try:
            if os.path.exists(skill_path):
                with open(skill_path, "r", encoding="utf-8") as f:
                    content = f.read()
                logger.info(f"Loaded skill: {skill_name}")
                return f"\n\n--- INJECTED SKILL: {skill_name} ---\n{content}\n--- END SKILL ---\n\n"
            else:
                logger.warning(f"Skill file not found: {skill_path}")
                return ""
        except Exception as e:
            logger.error(f"Error loading skill {skill_name}: {e}")
            return ""

    def load_active_skills(self, active_skills: list[str]) -> str:
        """
        Loads multiple skills and concatenates them for prompt injection.
        """
        if not active_skills:
            return ""
            
        combined_skills = []
        for skill in active_skills:
            skill_content = self.load_skill(skill)
            if skill_content:
                combined_skills.append(skill_content)
                
        if combined_skills:
            return "\n".join(combined_skills)
        return ""

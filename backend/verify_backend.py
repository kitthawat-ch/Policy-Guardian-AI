import requests
import time

def test_backend():
    print("Testing Compliance Check: Auto Approve")
    res1 = requests.post("http://localhost:8000/api/compliance/evaluate", json={
        "employee_id": "EMP-001",
        "expense_type": "MEALS",
        "amount": 50,
        "currency": "USD",
        "description": "Lunch with client"
    })
    print(res1.json())
    
    print("\nTesting Compliance Check: Escalate to Ticket")
    res2 = requests.post("http://localhost:8000/api/compliance/evaluate", json={
        "employee_id": "EMP-001",
        "expense_type": "MEALS",
        "amount": 500,
        "currency": "USD",
        "description": "Expensive dinner"
    })
    data = res2.json()
    print(data)
    ticket_id = data.get("ticket_id")

    if ticket_id:
        print("\nTesting Reviewer Approve")
        res3 = requests.put(f"http://localhost:8000/api/tickets/{ticket_id}/status", json={
            "status": "APPROVED"
        })
        print(res3.json())

    print("\nTesting Chat (Fallback / Mock Key)")
    res4 = requests.post("http://localhost:8000/api/chat/", json={
        "query": "What is the policy for client meals?",
        "employee_id": "EMP-001"
    })
    print(res4.json())

if __name__ == "__main__":
    test_backend()

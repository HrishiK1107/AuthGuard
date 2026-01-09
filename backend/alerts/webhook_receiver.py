from fastapi import FastAPI, Request

app = FastAPI()

@app.post("/webhook")
async def receive_alert(request: Request):
    payload = await request.json()
    print("\n🔥 ALERT RECEIVED 🔥")
    print(payload)
    return {"status": "ok"}

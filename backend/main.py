import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional
import uuid

app = FastAPI()

# CORS: allow http://localhost:5173 explicitly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        # rooms: { room_id: [ { "websocket": WebSocket, "id": str, "username": str } ] }
        self.rooms: Dict[str, List[Dict]] = {}

    async def connect(self, websocket: WebSocket, room_id: str, username: str):
        if room_id not in self.rooms:
            self.rooms[room_id] = []
        
        # 2-user limit enforcement
        if len(self.rooms[room_id]) >= 2:
            await websocket.send_json({"type": "error", "message": "Room is full (max 2 users)."})
            await websocket.close()
            return None

        user_id = str(uuid.uuid4())
        user_info = {
            "websocket": websocket,
            "id": user_id,
            "username": username
        }
        self.rooms[room_id].append(user_info)
        
        # First user is initiator
        is_initiator = len(self.rooms[room_id]) == 1
        role = "initiator" if is_initiator else "responder"
        
        # Broadcast room state to all in room
        await self.broadcast_room_state(room_id)
        
        return user_id

    async def disconnect(self, room_id: str, user_id: str):
        if room_id in self.rooms:
            self.rooms[room_id] = [u for u in self.rooms[room_id] if u["id"] != user_id]
            if not self.rooms[room_id]:
                del self.rooms[room_id]
            else:
                await self.broadcast_room_state(room_id)

    async def broadcast_room_state(self, room_id: str):
        if room_id not in self.rooms:
            return
        
        users = [{"id": u["id"], "username": u["username"]} for u in self.rooms[room_id]]
        
        for i, user in enumerate(self.rooms[room_id]):
            role = "initiator" if i == 0 else "responder"
            await user["websocket"].send_json({
                "type": "room_state",
                "users": users,
                "yourRole": role
            })

    async def relay_to_other(self, room_id: str, sender_id: str, message: dict):
        if room_id not in self.rooms:
            return
        
        for user in self.rooms[room_id]:
            if user["id"] != sender_id:
                await user["websocket"].send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()
    user_id = None
    try:
        # Initial join message to get username
        data = await websocket.receive_text()
        join_data = json.loads(data)
        if join_data.get("type") != "join_room":
            await websocket.close()
            return
        
        username = join_data.get("username", "Anonymous")
        user_id = await manager.connect(websocket, room_id, username)
        
        if not user_id:
            return

        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            msg_type = message.get("type")
            
            # Forward public_key, encapsulated_key, and chat_message to the OTHER user only
            if msg_type in ["public_key", "encapsulated_key", "chat_message"]:
                # Ensure senderId is set for the recipient
                message["senderId"] = user_id
                await manager.relay_to_other(room_id, user_id, message)
            
    except WebSocketDisconnect:
        if user_id:
            await manager.disconnect(room_id, user_id)
    except Exception as e:
        print(f"Error: {e}")
        if user_id:
            await manager.disconnect(room_id, user_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

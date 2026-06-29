from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from bson import ObjectId

from app.security.auth import get_current_user
from app.db.mongo import get_database
from app.schemas.user import UserPublic

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me")
async def get_me(current_user = Depends(get_current_user)):
    user = current_user.copy()
    user["id"] = str(user["_id"])
    user.pop("_id", None)  # Remove the ObjectId field
    user.pop("hashed_password", None)
    return user

@router.get("/search/{query}")
async def search_users(query: str, current_user = Depends(get_current_user)):
    db = get_database()
    # Search for users by username, excluding the current user
    # Limit to 10 results
    cursor = db.users.find({
        "username": {"$regex": f".*{query}.*", "$options": "i"},
        "_id": {"$ne": current_user["_id"]}
    }).limit(10)
    
    users = []
    async for user in cursor:
        users.append({
            "id": str(user["_id"]),
            "username": user["username"],
            "rating": user.get("rating", 1200),
            "level": user.get("level", 1)
        })
    return users

@router.post("/friends/request/{username}")
async def send_friend_request(username: str, current_user = Depends(get_current_user)):
    db = get_database()
    
    if username == current_user["username"]:
        raise HTTPException(status_code=400, detail="Cannot send friend request to yourself")
        
    target_user = await db.users.find_one({"username": username})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    target_id_str = str(target_user["_id"])
    current_id_str = str(current_user["_id"])
    
    # Check if already friends
    if current_id_str in target_user.get("friends", []):
        raise HTTPException(status_code=400, detail="Already friends")
        
    # Check if request already sent
    if current_id_str in target_user.get("friend_requests", []):
        raise HTTPException(status_code=400, detail="Friend request already sent")
        
    # Add to target user's friend requests
    await db.users.update_one(
        {"_id": target_user["_id"]},
        {"$addToSet": {"friend_requests": current_id_str}}
    )
    
    return {"message": "Friend request sent"}

@router.post("/friends/accept/{username}")
async def accept_friend_request(username: str, current_user = Depends(get_current_user)):
    db = get_database()
    
    target_user = await db.users.find_one({"username": username})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    target_id_str = str(target_user["_id"])
    current_id_str = str(current_user["_id"])
    
    # Check if request exists
    if target_id_str not in current_user.get("friend_requests", []):
        raise HTTPException(status_code=400, detail="No friend request from this user")
        
    # Add each other to friends list and remove the request
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$addToSet": {"friends": target_id_str},
            "$pull": {"friend_requests": target_id_str}
        }
    )
    
    await db.users.update_one(
        {"_id": target_user["_id"]},
        {
            "$addToSet": {"friends": current_id_str}
        }
    )
    
    return {"message": "Friend request accepted"}

@router.get("/friends")
async def get_friends(current_user = Depends(get_current_user)):
    db = get_database()
    friend_ids = current_user.get("friends", [])
    
    if not friend_ids:
        return []
        
    # Convert string IDs to ObjectIds
    obj_ids = []
    for fid in friend_ids:
        try:
            obj_ids.append(ObjectId(fid))
        except:
            pass
            
    cursor = db.users.find({"_id": {"$in": obj_ids}})
    friends = []
    
    async for user in cursor:
        friends.append({
            "id": str(user["_id"]),
            "username": user["username"],
            "rating": user.get("rating", 1200),
            "level": user.get("level", 1)
        })
        
    return friends

class InviteRequest(BaseModel):
    game_id: str

@router.post("/invites/send/{username}")
async def send_invite(username: str, invite: InviteRequest, current_user = Depends(get_current_user)):
    db = get_database()
    
    target_user = await db.users.find_one({"username": username})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    target_id_str = str(target_user["_id"])
    current_id_str = str(current_user["_id"])
    
    # Check if friends
    if current_id_str not in target_user.get("friends", []):
        raise HTTPException(status_code=403, detail="You can only invite friends")
        
    invite_obj = {
        "inviter_username": current_user["username"],
        "inviter_id": current_id_str,
        "game_id": invite.game_id
    }
    
    await db.users.update_one(
        {"_id": target_user["_id"]},
        {"$push": {"match_invites": invite_obj}}
    )
    
    return {"message": "Invite sent"}

@router.get("/invites")
async def get_invites(current_user = Depends(get_current_user)):
    return current_user.get("match_invites", [])

@router.post("/invites/clear")
async def clear_invites(current_user = Depends(get_current_user)):
    db = get_database()
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"match_invites": []}}
    )
    return {"message": "Invites cleared"}

class ClaimQuestXP(BaseModel):
    xp: int

@router.post("/quests/claim")
async def claim_quest_xp(claim: ClaimQuestXP, current_user = Depends(get_current_user)):
    db = get_database()
    xp_to_add = claim.xp
    if xp_to_add <= 0 or xp_to_add > 200:
        raise HTTPException(status_code=400, detail="Invalid XP amount")
        
    new_comp_xp = current_user.get("competitive_xp", 0) + xp_to_add
    new_global_xp = current_user.get("xp", 0) + xp_to_add
    
    new_comp_level = (new_comp_xp // 500) + 1
    new_global_level = (new_global_xp // 500) + 1
    
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "competitive_xp": new_comp_xp,
                "xp": new_global_xp,
                "competitive_level": new_comp_level,
                "level": new_global_level
            }
        }
    )
    return {
        "message": "XP claimed successfully",
        "competitive_xp": new_comp_xp,
        "competitive_level": new_comp_level,
        "xp": new_global_xp,
        "level": new_global_level
    }

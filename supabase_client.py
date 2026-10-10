import os
from dotenv import load_dotenv

# Load .env if present
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()

supabase_client = None

def get_supabase():
    global supabase_client
    if supabase_client is not None:
        return supabase_client
        
    if SUPABASE_URL and SUPABASE_KEY and "your-project-id" not in SUPABASE_URL:
        try:
            from supabase import create_client
            supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
            print(f"[Supabase] Successfully connected to {SUPABASE_URL}")
        except Exception as e:
            print(f"[Supabase Connection Warning] {e}")
            supabase_client = None
    return supabase_client

def save_crop_scan(scan_data):
    """
    Persists an AI leaf scan record to Supabase crop_scans table.
    """
    client = get_supabase()
    if not client:
        return None
    try:
        payload = {
            "crop_name": scan_data.get("crop", "Unknown"),
            "disease_name": scan_data.get("disease_name", "Unknown"),
            "pathogen": scan_data.get("pathogen", ""),
            "severity": scan_data.get("severity", ""),
            "confidence_score": scan_data.get("confidence_score", 0),
            "confidence_str": scan_data.get("confidence", ""),
            "symptoms": scan_data.get("symptoms", ""),
            "causes": scan_data.get("causes", ""),
            "chemical_treatment": scan_data.get("treatment", []),
            "organic_solution": scan_data.get("organic_solution", []),
            "is_healthy": scan_data.get("is_healthy", False),
            "image_url": scan_data.get("image_url", ""),
            "farmer_location": scan_data.get("farmer_location", "India")
        }
        res = client.table("crop_scans").insert(payload).execute()
        return res.data
    except Exception as e:
        print(f"[Supabase save_crop_scan Error] {e}")
        return None

def save_chat_message(sender, message, suggested_actions=None):
    """
    Logs farmer conversation queries and HAL assistant answers.
    """
    client = get_supabase()
    if not client:
        return None
    try:
        payload = {
            "sender": sender,
            "message": message,
            "suggested_actions": suggested_actions or []
        }
        res = client.table("hal_chat_logs").insert(payload).execute()
        return res.data
    except Exception as e:
        print(f"[Supabase save_chat_message Error] {e}")
        return None

def get_recent_scans(limit=10):
    """
    Retrieves previous scan history from Supabase.
    """
    client = get_supabase()
    if not client:
        return []
    try:
        res = client.table("crop_scans").select("*").order("created_at", desc=True).limit(limit).execute()
        return res.data or []
    except Exception as e:
        print(f"[Supabase get_recent_scans Error] {e}")
        return []

def get_connection_status():
    """
    Returns connection diagnostics for UI indicator.
    """
    client = get_supabase()
    if client:
        return {"connected": True, "url": SUPABASE_URL}
    return {
        "connected": False,
        "message": "Supabase credentials not configured in .env. Falling back to local offline mode."
    }

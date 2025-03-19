"""
Test script to verify your Supabase connection.
Run this script with `python test_supabase.py` after setting up your .env file.
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Supabase credentials
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    print("❌ Error: SUPABASE_URL or SUPABASE_KEY not found in environment variables.")
    print("Please make sure you have a .env file with these variables set.")
    exit(1)

try:
    # Initialize Supabase client
    print("🔄 Connecting to Supabase...")
    supabase: Client = create_client(supabase_url, supabase_key)
    
    # Test the connection by getting the server timestamp
    print("🔄 Testing connection...")
    response = supabase.rpc('get_timestamp').execute()
    
    if response.data:
        print(f"✅ Connection successful! Server time: {response.data}")
        
        # Check if tables exist
        print("🔄 Checking tables...")
        tasks_response = supabase.table('tasks').select('*', count='exact').limit(1).execute()
        profiles_response = supabase.table('profiles').select('*', count='exact').limit(1).execute()
        
        print(f"✅ Tasks table found. Count: {tasks_response.count}")
        print(f"✅ Profiles table found. Count: {profiles_response.count}")
        
        print("\n🎉 Your Supabase setup is complete and working correctly!")
    else:
        print("❌ Connection failed. Unable to get server timestamp.")
        
except Exception as e:
    print(f"❌ Error connecting to Supabase: {str(e)}")
    print("\nPlease check your credentials and make sure your Supabase project is set up correctly.") 
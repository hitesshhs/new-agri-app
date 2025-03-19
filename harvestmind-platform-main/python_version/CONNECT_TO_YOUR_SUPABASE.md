# Connecting to Your Original Supabase Account

This guide will help you connect the HarvestMind application to your original Supabase account.

## Step 1: Set Up Your Supabase Project

If you don't already have a Supabase project:

1. Go to [Supabase](https://supabase.com/) and sign in or create an account
2. Create a new project with a name of your choice
3. Wait for the database to be ready

## Step 2: Configure the Environment Variables

1. In your project, look for the `.env` file in the `python_version` directory
2. Update the following values:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

To find these values:
- Go to the Supabase dashboard
- Select your project
- Go to Project Settings > API
- Copy the URL and the anon/public key (NOT the secret key)

## Step 3: Set Up the Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase_setup.sql` from this project
3. Paste it into the SQL Editor and run the queries

This will create:
- A `tasks` table for storing task data
- A `profiles` table for user profiles
- Row Level Security (RLS) policies to protect your data
- Triggers to create user profiles automatically

## Step 4: Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Make sure the Email Provider is enabled
3. If you want to use other providers (Google, GitHub, etc.), configure them as needed
4. Under Email Templates, customize the invitation and confirmation emails if desired

## Step 5: Test Your Connection

1. Run the test script to verify your connection:
```
python test_supabase.py
```

If successful, you'll see confirmation that your tables are set up correctly.

## Step 6: Run the Application

Now you can run the application with your original Supabase account:
```
python app.py
```

## Troubleshooting

If you encounter any issues:

1. Double-check your environment variables
2. Make sure you've run the SQL setup script
3. Check that authentication is properly configured in Supabase
4. Look for error messages in the console when running the application
5. Try creating a new user through the application's register page

## Security Considerations

- The anon/public key is safe to use in client-side code
- Never expose your service_role key or any other secrets
- All database access should go through Row Level Security (RLS) policies
- For production, use a more secure SECRET_KEY in your .env file 
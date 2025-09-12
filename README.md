# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Super Admin Setup Guide

To use the super admin features, you must create a super admin user in Firebase Authentication and then create a corresponding configuration document in Firestore.

### Step 1: Create the Super Admin User

1.  Go to your **Firebase Console** -> **Authentication** -> **Users**.
2.  Add a new user with the email and password you have set in your `.env` file for `NEXT_PUBLIC_SUPER_ADMIN_EMAIL`.
3.  Copy the **UID** of the user you just created.

### Step 2: Set Your Environment Variables

1.  Open your `.env` file.
2.  Ensure the following variables are set with the correct values from the user you just created:
    ```
    NEXT_PUBLIC_SUPER_ADMIN_EMAIL=rohitsengar02@gmail.com
    NEXT_PUBLIC_SUPER_ADMIN_UID=IXgGghGWNhYkXgk8mV7TqWd4s1f2
    ```

### Step 3: Create the Super Admin Config in Firestore

1.  Go to your **Firebase Console** -> **Firestore Database**.
2.  Click **"Start collection"**.
3.  For **"Collection ID"**, enter `config`.
4.  Click **"Next"**.
5.  For **"Document ID"**, enter `superadmin`.
6.  For the first field, enter `uid`.
7.  For the value, paste the UID you copied in Step 1 (`IXgGghGWNhYkXgk8mV7TqWd4s1f2`).
8.  Click **"Save"**.

After completing these steps, you will be able to log in as the super admin and approve/reject district admin applications. The `PERMISSION_DENIED` error will be resolved.

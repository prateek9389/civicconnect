# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Super Admin Setup Guide

To use the super admin features, you must create a super admin user in Firebase Authentication and then create a corresponding document for them in Firestore. This is a required one-time setup.

### Step 1: Create the Super Admin User in Firebase Authentication

1.  Go to your **Firebase Console** -> **Authentication** -> **Users** tab.
2.  Click **"Add user"**.
3.  Enter the email and password you have set in your `.env` file:
    *   **Email:** `rohitsengar02@gmail.com`
    *   **Password:** A secure password of your choice (e.g., `RUdra@#602`).
4.  After the user is created, find them in the user list and copy their **UID**. It should be `IXgGghGWNhYkXgk8mV7TqWd4s1f2`.

### Step 2: Ensure Your Environment Variables Are Set

1.  Open your `.env` file in the project.
2.  Confirm that the following variables are correctly set with the user details from Step 1:
    ```
    NEXT_PUBLIC_SUPER_ADMIN_EMAIL=rohitsengar02@gmail.com
    NEXT_PUBLIC_SUPER_ADMIN_UID=IXgGghGWNhYkXgk8mV7TqWd4s1f2
    ```

### Step 3: Create the Super Admin Document in Firestore

This is the most important step for resolving the `PERMISSION_DENIED` error. This document tells your security rules that this user is a super admin.

1.  Go to your **Firebase Console** -> **Firestore Database**.
2.  Click **"+ Start collection"**.
3.  For **"Collection ID"**, enter `admins`. Click **"Next"**.
4.  For **"Document ID"**, paste the UID you copied in Step 1 (`IXgGghGWNhYkXgk8mV7TqWd4s1f2`).
5.  Add the following fields to the document:
    *   Field 1:
        *   **Field:** `email`
        *   **Type:** `string`
        *   **Value:** `rohitsengar02@gmail.com`
    *   Click **"Add field"**.
    *   Field 2:
        *   **Field:** `name`
        *   **Type:** `string`
        *   **Value:** `Super Admin`
    *   Click **"Add field"**.
    *   Field 3:
        *   **Field:** `role`
        *   **Type:** `string`
        *   **Value:** `superadmin`
    *   Click **"Add field"**.
    *   Field 4:
        *   **Field:** `status`
        *   **Type:** `string`
        *   **Value:** `approved`
6.  Click **"Save"**.

After completing these three steps, the `PERMISSION_DENIED` error will be resolved, and you will be able to log in as the super admin and manage applications successfully.

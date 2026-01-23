# Image Storage with Cloudinary & Firestore

This project uses **Cloudinary** for image hosting and **Cloud Firestore** for storing metadata and image links.

## The Workflow

When an owner adds or updates a menu item with a new image, the following happens:

1.  **Image Selection**: The owner picks an image from the device gallery using `expo-image-picker`.
2.  **Cloudinary Upload**: The image is uploaded directly to Cloudinary using an **Unsigned Upload** request.
    -   **Endpoint**: `https://api.cloudinary.com/v1_1/dvaahhisn/image/upload`
    -   **Cloud Name**: `dvaahhisn`
    -   **API Key**: `669284443773523`
    -   **Upload Preset**: `mlchklbu`
3.  **Link Generation**: Cloudinary returns a `secure_url` (e.g., `https://res.cloudinary.com/dvaahhisn/image/upload/v12345/example.jpg`).
4.  **Firestore Storage**: This `secure_url` is saved to the `image` field of the menu item document in Firestore.

## Why This Approach?

-   **Cloudinary** is designed to store and serve images efficiently with built-in optimization.
-   **Firestore** stores the "Link" (the URL), which is a small piece of text. This makes fetching menu details extremely fast.

## Implementation Files

-   **Frontend Logic**: [add-item.tsx](file:///c:/Users/L%20o%20V%20e/Desktop/firebased-quickbite-main/app/(owner)/add-item.tsx) - Contains the `uploadToCloudinary` function and the submission logic.
-   **Firestore Operations**: [menu.ts](file:///c:/Users/L%20o%20V%20e/Desktop/firebased-quickbite-main/api/menu.ts) - Standard Firestore `addDoc` and `updateDoc` calls.
-   **Rendering**: [FoodCard.tsx](file:///c:/Users/L%20o%20V%20e/Desktop/firebased-quickbite-main/components/FoodCard.tsx) and [food-details.tsx](file:///c:/Users/L%20o%20V%20e/Desktop/firebased-quickbite-main/app/(user)/food-details.tsx) use `<Image source={{ uri: item.image }} />` to fetch and display the hosted image.

> [!IMPORTANT]
> Because the `secure_url` is stored in Firestore, any device (Customer, Staff, or Owner) can fetch the menu and see the exact same image.

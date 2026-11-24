# Vishal CSC Centre – Website + Customer App + Admin App

KOI FOLDER NAHI HAI — saari files ek hi level par hain. GitHub par SAB files upload karni hain.

Pages (Vercel par):
- `/`       Website
- `/app`    Customer app (order karo, order track karo)
- `/admin`  Admin app (Vishal ke liye)

## GitHub par upload (purane files replace ho jayengi)
1. GitHub repo kholo > Add file > Upload files.
2. Is zip ko extract karo, andar ki SAARI files (26) select karke drag karo. Commit dabao.
3. Agar repo mein purane folders `app` ya `admin` hain, to unhe delete kar do (nahi to /app mein gadbad hogi).
4. Vercel apne aap deploy kar dega. Phir `/app` aur `/admin` kholkar dekho.

## Firebase (ek baar)
1. Authentication: Email/Password chalu + ek admin user; **Anonymous** bhi chalu.
2. Authentication > Settings > Authorized domains mein `vishalcsc-v.vercel.app` jodo.
3. Firestore Rules: `firestore.rules` ka text paste karo, `YOUR_ADMIN_EMAIL` ki jagah admin email, Publish.
4. `/admin` > login > Services > "14 default services daalo".

Domain `vishalcsc-v.vercel.app` pehle se files mein set hai. Apna domain baad mein lo to Find & Replace karna.

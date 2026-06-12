import Hero from '@/components/Hero'
import React from 'react'

const Home = () => {
  return (
    <div>
      <Hero />
    </div>
  )
}

export default Home



// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { connectDB } from "@/lib/db";
// import User from "@/models/User";
// import AdminDashboard from "@/components/admin/AdminDashboard";
// import UserDashboard from "@/components/UserDashboard";
// import DeliveryDashboard from "@/components/DeliveryDashboard";

// const Home = async () => {
//   const session = await getServerSession(authOptions);

//   if (!session?.user?.email) {
//     return <UserDashboard/>; // Header already in layout
//   }

//   await connectDB();
//   const user = await User.findOne({ email: session.user.email });

//   if (!user) {
//     return null;
//   }

//   return (
//     <>
//       {user.role === "user" ? (
//         <UserDashboard />
//       ) : user.role === "admin" ? (
//         <AdminDashboard />
//       ) : (
//         <DeliveryDashboard />
//       )}
//     </>
//   );
// };

// export default Home;



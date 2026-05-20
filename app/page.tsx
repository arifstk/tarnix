

// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { connectDB } from "@/lib/db";
// import User from "@/models/User";
// import Header from "@/components/Header";
// import AdminDashboard from "@/components/admin/AdminDashboard";
// import DeliveryBoy from "@/components/DeliveryBoy";
// import UserDashboard from "@/components/UserDashboard";

// const Home = async () => {
//   const session = await getServerSession(authOptions);

//   // Not logged in — show public home page with navbar only
//   if (!session?.user?.email) {
//     return <Header role={null} />;
//   }

//   await connectDB();
//   const user = await User.findOne({ email: session.user.email });

//   // User deleted from DB — show navbar only (jwt callback will auto sign out)
//   if (!user) {
//     return <Header role={null} />;
//   }

//   const plainUser = JSON.parse(JSON.stringify(user));

//   return (
//     <>
//       <Header role={plainUser.role} />
//       {user.role === "user" ? (
//         <UserDashboard />
//       ) : user.role === "admin" ? (
//         <AdminDashboard />
//       ) : (
//         <DeliveryBoy />
//       )}
//     </>
//   );
// };

// export default Home;




import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import AdminDashboard from "@/components/admin/AdminDashboard";
import DeliveryBoy from "@/components/DeliveryBoy";
import UserDashboard from "@/components/UserDashboard";

const Home = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null; // Header already in layout
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return null;
  }

  return (
    <>
      {user.role === "user" ? (
        <UserDashboard />
      ) : user.role === "admin" ? (
        <AdminDashboard />
      ) : (
        <DeliveryBoy />
      )}
    </>
  );
};

export default Home;
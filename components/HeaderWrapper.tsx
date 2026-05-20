import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Header from "@/components/Header";

const HeaderWrapper = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return <Header role={null} />;
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return <Header role={null} />;
  }

  return <Header role={user.role} />;
};

export default HeaderWrapper; 
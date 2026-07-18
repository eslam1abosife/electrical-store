<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="text-center">
      <div class="animate-spin text-4xl mb-4">⏳</div>
      <p class="text-lg">جاري تسجيل الدخول...</p>
    </div>
  </div>
</template>

<script setup>
import { supabase } from "~/lib/supabase";
import { useUserStore } from "~/stores/user";

const router = useRouter();
const userStore = useUserStore();

// دالة للعودة إلى صفحة checkout مباشرة
const redirectToCheckout = () => {
  const redirectToCheckout = localStorage.getItem('redirectToCheckout');
  if (redirectToCheckout) {
    localStorage.removeItem('redirectToCheckout');
    return router.push("/checkout");
  }
  return router.push("/");
};

onMounted(async () => {
  try {
    // الحصول على الجلسة من Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    if (session) {
      // الحصول على بيانات المستخدم
      const user = session.user;
      
      // الحصول على دور المستخدم
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("email", user.email)
        .maybeSingle();
      
      const role = profileData?.role || "customer";
      
      // إعداد جلسة المستخدم
      userStore.setUser({
        id: user.id,
        email: user.email,
        role: role,
        isAdmin: role === "admin",
      });
      
      userStore.setSession(session);
      
      console.log("✅ تم تسجيل الدخول بنجاح!");
      
      // التوجيه إلى checkout مباشرة
      await redirectToCheckout();
    } else {
      console.warn("⚠️ لا توجد جلسة نشطة");
      router.push("/login");
    }
  } catch (error) {
    console.error("❌ خطأ في معالجة التوجيه:", error);
    router.push("/login");
  }
});
</script>
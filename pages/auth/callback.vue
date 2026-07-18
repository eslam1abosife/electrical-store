<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div class="text-center text-white">
      <div class="text-6xl mb-4 animate-spin">⏳</div>
      <h2 class="text-2xl font-bold">جاري تسجيل الدخول...</h2>
      <p class="text-gray-400 mt-2">يرجى الانتظار</p>
    </div>
  </div>
</template>

<script setup>
import { supabase } from '~/lib/supabase';
import { useUserStore } from '~/stores/user';

const router = useRouter();
const userStore = useUserStore();

onMounted(async () => {
  try {
    // الحصول على جلسة المستخدم
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    if (session?.user) {
      // جلب دور المستخدم
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("email", session.user.email)
        .maybeSingle();

      const role = profileData?.role || "customer";
      
      // تخزين بيانات المستخدم
      userStore.setUser({
        id: session.user.id,
        email: session.user.email,
        role: role,
        isAdmin: role === "admin",
      });

      userStore.setSession(session);
      
      // التوجيه حسب الدور
      if (role === "admin" || role === "partner") {
        await router.push("/dashboard");
      } else {
        await router.push("/");
      }
      
      console.log('✅ تم تسجيل الدخول بنجاح عبر OAuth!');
    } else {
      // إذا لم توجد جلسة، ارجع لصفحة تسجيل الدخول
      await router.push("/login");
    }
  } catch (error) {
    console.error("❌ خطأ في معالجة تسجيل الدخول:", error);
    alert("❌ حدث خطأ: " + error.message);
    await router.push("/login");
  }
});
</script>
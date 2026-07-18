<template>
  <div class="min-h-screen bg-gray-100 py-12 px-4">
    <div class="container mx-auto max-w-4xl bg-white rounded-2xl shadow-lg p-8">
      <h1 class="text-3xl font-bold mb-6 text-center">سياسة الخصوصية</h1>
      
      <div class="space-y-4 text-right">
        <section>
          <h2 class="text-xl font-semibold mb-2">1. المعلومات التي نجمعها</h2>
          <p class="text-gray-700">
            نجمع المعلومات التالية عند استخدامك لتطبيقنا:
          </p>
          <ul class="list-disc list-inside mr-4 text-gray-700">
            <li>البريد الإلكتروني</li>
            <li>الاسم</li>
            <li>رقم الهاتف</li>
            <li>العنوان (اختياري)</li>
            <li>بيانات الطلبات</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">2. كيف نستخدم معلوماتك</h2>
          <p class="text-gray-700">
            نستخدم المعلومات التي نجمعها للأغراض التالية:
          </p>
          <ul class="list-disc list-inside mr-4 text-gray-700">
            <li>معالجة طلباتك</li>
            <li>تحسين تجربة المستخدم</li>
            <li>التواصل معك بشأن طلباتك</li>
            <li>إرسال عروض وتحديثات (بموافقتك)</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">3. مشاركة البيانات</h2>
          <p class="text-gray-700">
            لا نشارك بياناتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:
          </p>
          <ul class="list-disc list-inside mr-4 text-gray-700">
            <li>عند الضرورة لمعالجة طلبك (مثل شركات الشحن)</li>
            <li>عندما يطلب منا القانون ذلك</li>
            <li>بموافقتك الصريحة</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">4. حماية البيانات</h2>
          <p class="text-gray-700">
            نتخذ إجراءات أمنية مناسبة لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الكشف أو التدمير.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">5. حقوقك</h2>
          <p class="text-gray-700">
            لديك الحق في:
          </p>
          <ul class="list-disc list-inside mr-4 text-gray-700">
            <li>الوصول إلى بياناتك الشخصية</li>
            <li>تصحيح بياناتك غير الصحيحة</li>
            <li>طلب حذف بياناتك</li>
            <li>الاعتراض على معالجة بياناتك</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">6. الاتصال بنا</h2>
          <p class="text-gray-700">
            إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا على:
          </p>
          <p class="text-blue-600 font-semibold">
            📧 eslamabosife69@gmail.com
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">7. التحديثات</h2>
          <p class="text-gray-700">
            قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سيتم إعلامك بأي تغييرات جوهرية.
          </p>
        </section>

        <div class="text-center text-gray-500 text-sm mt-8 border-t pt-4">
          آخر تحديث: {{ new Date().toLocaleDateString('ar-EG') }}
        </div>
      </div>
    </div>
  </div>
</template>
-- Supabase security advisor: "Function Search Path Mutable" uyarısı — search_path
-- ayarlanmamış fonksiyonlar, çağıran oturumun search_path'ine bağımlı kalır ve teorik
-- olarak search_path hijack riski taşır. Fonksiyon gövdelerini değiştirmeden sadece
-- search_path ayarını sabitliyoruz.
ALTER FUNCTION public.generate_order_code() SET search_path = 'public';
ALTER FUNCTION public.set_order_code() SET search_path = 'public';
ALTER FUNCTION public.increment_family_action(uuid, text) SET search_path = 'public';

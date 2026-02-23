import { useShop } from "@/context/ShopContext";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, User, Clock, ArrowLeft, Share2 } from "lucide-react";
import type { Metadata } from "next";

// Sample blog posts data - in a real app, this would come from a CMS or database
const sampleBlogPosts = [
  {
    id: '1',
    title: {
      en: 'How to Choose the Perfect Skincare Routine',
      ar: 'كيفية اختيار روتين العناية بالبشرة المثالي',
      fr: 'Comment choisir la routine de soins parfaite'
    },
    excerpt: {
      en: 'Discover the essential steps to building a skincare routine that works for your skin type and concerns.',
      ar: 'اكتشف الخطوات الأساسية لبناء روتين عناية بالبشرة يناسب بشرتك ومشاكلك.',
      fr: 'Découvrez les étapes essentielles pour construire une routine de soins qui fonctionne pour votre type de peau.'
    },
    content: {
      en: `# How to Choose the Perfect Skincare Routine

Building the perfect skincare routine doesn't have to be complicated. With the right knowledge and products, you can achieve healthy, glowing skin that makes you feel confident.

## Understanding Your Skin Type

Before diving into products, it's crucial to understand your skin type:

- **Normal Skin**: Balanced, not too oily or dry
- **Oily Skin**: Excess sebum production, shiny appearance
- **Dry Skin**: Lack of moisture, tight or flaky feeling
- **Combination Skin**: Oily in some areas, dry in others
- **Sensitive Skin**: Easily irritated, prone to redness

## The Essential Steps

### 1. Cleansing
Start with a gentle cleanser that matches your skin type. Cleanse twice daily - morning and night.

### 2. Toning
A toner helps balance your skin's pH and prepares it for better product absorption.

### 3. Treating
This is where you address specific concerns:
- Acne: Use products with salicylic acid or benzoyl peroxide
- Aging: Look for retinoids or peptides
- Hyperpigmentation: Consider vitamin C or niacinamide

### 4. Moisturizing
Even oily skin needs moisture. Choose a lightweight, non-comedogenic moisturizer.

### 5. Sun Protection
The most crucial step! Use SPF 30+ daily, regardless of weather.

## Building Your Routine

Start simple with the basics and gradually add products. Listen to your skin and adjust as needed.

## Final Thoughts

Remember that consistency is key in skincare. Give products at least 4-6 weeks to show results before deciding if they work for you.`,
      ar: `# كيفية اختيار روتين العناية بالبشرة المثالي

بناء روتين العناية بالبشرة المثالي لا يجب أن يكون معقدا. بالمعرفة والمنتجات المناسبة، يمكنك تحقيق بشرة صحية ومشرعة تجعلك تشعر بالثقة.

## فهم نوع بشرتك

قبل الغوص في المنتجات، من الضروري فهم نوع بشرتك:

- **البشرة العادية**: متوازنة، ليست دهنية أو جافة جدا
- **البشرة الدهنية**: إفراز زهمي زائد، مظهر لامع
- **البشرة الجافة**: نقص الرطوبة، شعور بالشد أو التقشر
- **البشرة المختلطة**: دهنية في بعض المناطق، جافة في أخرى
- **البشرة الحساسة**: تهيج بسهولة، عرضة للاحمرار

## الخطوات الأساسية

### 1. التنظيف
ابدأ بمنظف لطيف يناسب نوع بشرتك. نظف مرتين يوميا - صباحا ومساء.

### 2. التونر
التونر يساعد في توازن درجة حموضة بشرتك ويجهزها لامتصاص أفضل للمنتجات.

### 3. العلاج
هنا حيث تعالج مشاكل محددة:
- حب الشباب: استخدم منتجات تحتوي على حمض الساليسيليك أو البنزويل بيروكسيد
- الشيخوخة: ابحث عن الريتينويدات أو الببتيدات
- فرط التصبغ: فكر في فيتامين C أو النياسيناميد

### 4. الترطيب
حتى البشرة الدهنية تحتاج رطوبة. اختر مرطب خفيف غير سدوي.

### 5. الحماية من الشمس
الخطوة الأكثر أهمية! استخدم SPF 30+ يوميا، بغض النظر عن الطقس.

## بناء روتينك

ابدأ بسيطا بالأساسيات وأضف المنتجات تدريجيا. استمع لبشرتك وعدل حسب الحاجة.

## أفكار نهائية

تذكر أن الاستمرارية هي مفتاح العناية بالبشرة. أعطِ المنتجات 4-6 أسابيع على الأقل لإظهار النتائج قبل تقرير ما إذا كانت تناسبك.`,
      fr: `# Comment choisir la routine de soins parfaite

Construire la routine de soins parfaite ne doit pas être compliquée. Avec les bonnes connaissances et produits, vous pouvez obtenir une peau saine et éclatante qui vous fait sentir confiant.

## Comprendre votre type de peau

Avant de plonger dans les produits, il est crucial de comprendre votre type de peau :

- **Peau normale** : Équilibrée, ni trop grasse ni trop sèche
- **Peau grasse** : Production excessive de sébum, apparence brillante
- **Peau sèche** : Manque d'humidité, sensation de tiraillement ou desquamation
- **Peau mixte** : Grasse dans certaines zones, sèche dans d'autres
- **Peau sensible** : Facilement irritée, sujette aux rougeurs

## Les étapes essentielles

### 1. Le nettoyage
Commencez avec un nettoyant doux qui correspond à votre type de peau. Nettoyez deux fois par jour - matin et soir.

### 2. Le tonique
Un tonique aide à équilibrer le pH de votre peau et la prépare à une meilleure absorption des produits.

### 3. Le traitement
C'est ici que vous adressez des préoccupations spécifiques :
- Acné : Utilisez des produits avec de l'acide salicylique ou du peroxyde de benzoyle
- Vieillissement : Cherchez des rétinoïdes ou des peptides
- Hyperpigmentation : Considérez la vitamine C ou la niacinamide

### 4. L'hydratation
Même la peau grasse a besoin d'hydratation. Choisissez un hydratant léger et non comédogène.

### 5. La protection solaire
L'étape la plus cruciale ! Utilisez SPF 30+ quotidiennement, quel que soit le temps.

## Construire votre routine

Commencez simple avec les bases et ajoutez progressivement des produits. Écoutez votre peau et ajustez au besoin.

## Pensées finales

Rappelez-vous que la cohérence est la clé des soins de la peau. Donnez aux produits au moins 4-6 semaines pour montrer des résultats avant de décider s'ils fonctionnent pour vous.`
    },
    author: 'Skincare Expert',
    publishDate: '2024-02-20',
    readTime: '5 min read',
    category: 'Skincare',
    image: '/blog/skincare-routine.jpg',
    slug: 'how-to-choose-perfect-skincare-routine'
  }
];

interface BlogPostProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  const post = sampleBlogPosts.find(p => p.slug === slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title.en,
    description: post.excerpt.en,
    openGraph: {
      title: post.title.en,
      description: post.excerpt.en,
      type: 'article',
    },
  };
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = sampleBlogPosts.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-emerald-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-sm text-emerald-100">
                <Calendar className="w-4 h-4" />
                {post.publishDate}
              </span>
              <span className="flex items-center gap-1 text-sm text-emerald-100">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              {post.title.en}
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">{post.author}</p>
                <p className="text-sm text-emerald-100">Expert Writer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image Placeholder */}
          <div className="aspect-[16/9] bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-8 overflow-hidden">
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-200 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <span className="text-emerald-600 text-3xl font-bold">📝</span>
                </div>
                <p className="text-emerald-600 font-medium">Featured Image</p>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <article className="prose prose-lg max-w-none">
            <div 
              className="text-gray-700 leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ 
                __html: post.content.en.replace(/\n/g, '<br>').replace(/#{1,6}\s/g, (match) => {
                  const level = match.trim().length;
                  return `<h${level} class="text-2xl font-bold text-gray-900 mt-8 mb-4">`;
                })
              }} 
            />
          </article>

          {/* Share Section */}
          <div className="border-t border-gray-200 mt-12 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Share this article</h3>
                <p className="text-gray-600">Help others discover this helpful content</p>
              </div>
              <div className="flex gap-3">
                <button className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          <div className="border-t border-gray-200 mt-12 pt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {sampleBlogPosts
                .filter(p => p.id !== post.id)
                .slice(0, 2)
                .map(relatedPost => (
                  <Link 
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="group block bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
                  >
                    <h4 className="font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                      {relatedPost.title.en}
                    </h4>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {relatedPost.excerpt.en}
                    </p>
                  </Link>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

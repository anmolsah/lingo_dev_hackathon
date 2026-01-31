import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Sample government schemes data
const schemes = [
    {
        scheme_code: 'PM_JANMAN',
        category: 'tribal_welfare',
        ministry: 'Ministry of Tribal Affairs',
        target_audience: 'Tribal communities',
        is_active: true
    },
    {
        scheme_code: 'PM_KISAN',
        category: 'agriculture',
        ministry: 'Ministry of Agriculture',
        target_audience: 'Farmers',
        is_active: true
    },
    {
        scheme_code: 'ANEMIA_MUKT_BHARAT',
        category: 'health',
        ministry: 'Ministry of Health',
        target_audience: 'All citizens',
        is_active: true
    },
    {
        scheme_code: 'SKILL_INDIA',
        category: 'education',
        ministry: 'Ministry of Skill Development',
        target_audience: 'Youth',
        is_active: true
    },
    {
        scheme_code: 'AYUSHMAN_BHARAT',
        category: 'health',
        ministry: 'Ministry of Health',
        target_audience: 'Low income families',
        is_active: true
    }
];

// Translations for each scheme
const translations = {
    'PM_JANMAN': {
        en: {
            title: 'PM-JANMAN Scheme',
            short_description: 'Comprehensive initiative for Particularly Vulnerable Tribal Groups (PVTGs)',
            full_description: 'The Pradhan Mantri Janjati Adivasi Nyaya Maha Abhiyan (PM-JANMAN) is a comprehensive initiative for the welfare of Particularly Vulnerable Tribal Groups. It aims to provide basic amenities and services to tribal communities.',
            eligibility_criteria: 'Members of recognized PVTGs residing in designated tribal areas. Indian citizens with valid tribal certificates.',
            benefits: 'Housing assistance, Clean drinking water, Electricity connections, Road connectivity, Education support, Healthcare facilities',
            application_process: 'Visit your local tribal welfare office. Submit proof of PVTG membership. Fill application form and attach required documents.',
            required_documents: 'Tribal certificate, Aadhaar card, Address proof, Bank account details'
        },
        hi: {
            title: 'पीएम-जनमान योजना',
            short_description: 'विशेष रूप से कमजोर जनजातीय समूहों (PVTGs) के लिए व्यापक पहल',
            full_description: 'प्रधानमंत्री जनजाति आदिवासी न्याय महा अभियान (PM-JANMAN) विशेष रूप से कमजोर जनजातीय समूहों के कल्याण के लिए एक व्यापक पहल है। इसका उद्देश्य जनजातीय समुदायों को बुनियादी सुविधाएं और सेवाएं प्रदान करना है।',
            eligibility_criteria: 'निर्दिष्ट आदिवासी क्षेत्रों में रहने वाले मान्यता प्राप्त PVTGs के सदस्य। वैध जनजातीय प्रमाणपत्र वाले भारतीय नागरिक।',
            benefits: 'आवास सहायता, स्वच्छ पेयजल, बिजली कनेक्शन, सड़क संपर्क, शिक्षा सहायता, स्वास्थ्य सुविधाएं',
            application_process: 'अपने स्थानीय जनजातीय कल्याण कार्यालय पर जाएं। PVTG सदस्यता का प्रमाण जमा करें। आवेदन पत्र भरें और आवश्यक दस्तावेज संलग्न करें।',
            required_documents: 'जनजातीय प्रमाणपत्र, आधार कार्ड, पता प्रमाण, बैंक खाता विवरण'
        },
        bn: {
            title: 'পিএম-জনমন প্রকল্প',
            short_description: 'বিশেষভাবে দুর্বল উপজাতি গোষ্ঠীর (PVTGs) জন্য ব্যাপক উদ্যোগ',
            full_description: 'প্রধানমন্ত্রী জনজাতি আদিবাসী ন্যায় মহা অভিযান (PM-JANMAN) বিশেষভাবে দুর্বল উপজাতি গোষ্ঠীর কল্যাণের জন্য একটি ব্যাপক উদ্যোগ।',
            eligibility_criteria: 'নির্দিষ্ট উপজাতি এলাকায় বসবাসকারী স্বীকৃত PVTG-এর সদস্য।',
            benefits: 'আবাসন সহায়তা, পরিষ্কার পানীয় জল, বিদ্যুৎ সংযোগ, সড়ক যোগাযোগ',
            application_process: 'আপনার স্থানীয় উপজাতি কল্যাণ অফিসে যান।',
            required_documents: 'উপজাতি সার্টিফিকেট, আধার কার্ড, ঠিকানার প্রমাণ'
        }
    },
    'PM_KISAN': {
        en: {
            title: 'PM-KISAN Scheme',
            short_description: 'Income support to farmer families across India',
            full_description: 'Pradhan Mantri Kisan Samman Nidhi is a central government scheme that provides income support of Rs. 6,000 per year to eligible farmer families.',
            eligibility_criteria: 'Land-owning farmer families with cultivable land. Not applicable to institutional landholders.',
            benefits: 'Rs. 6,000 per year in three equal installments of Rs. 2,000 each, directly transferred to bank accounts',
            application_process: 'Register through Common Service Centers or online at pmkisan.gov.in. Provide land records and Aadhaar details.',
            required_documents: 'Aadhaar card, Land ownership documents, Bank account details, Mobile number'
        },
        hi: {
            title: 'पीएम-किसान योजना',
            short_description: 'भारत भर में किसान परिवारों को आय सहायता',
            full_description: 'प्रधानमंत्री किसान सम्मान निधि एक केंद्र सरकार की योजना है जो पात्र किसान परिवारों को प्रति वर्ष 6,000 रुपये की आय सहायता प्रदान करती है।',
            eligibility_criteria: 'खेती योग्य भूमि वाले भूमिधारक किसान परिवार। संस्थागत भूमिधारकों पर लागू नहीं।',
            benefits: 'प्रति वर्ष 6,000 रुपये, 2,000 रुपये की तीन समान किस्तों में, सीधे बैंक खातों में स्थानांतरित',
            application_process: 'सामान्य सेवा केंद्रों या pmkisan.gov.in पर ऑनलाइन पंजीकरण करें।',
            required_documents: 'आधार कार्ड, भूमि स्वामित्व दस्तावेज, बैंक खाता विवरण, मोबाइल नंबर'
        },
        bn: {
            title: 'পিএম-কিসান প্রকল্প',
            short_description: 'ভারত জুড়ে কৃষক পরিবারগুলিকে আয় সহায়তা',
            full_description: 'প্রধানমন্ত্রী কিষাণ সম্মান নিধি যোগ্য কৃষক পরিবারগুলিকে বার্ষিক ৬,০০০ টাকা আয় সহায়তা প্রদান করে।',
            eligibility_criteria: 'চাষযোগ্য জমি সহ জমির মালিক কৃষক পরিবার।',
            benefits: 'বার্ষিক ৬,০০০ টাকা তিনটি সমান কিস্তিতে',
            application_process: 'কমন সার্ভিস সেন্টার বা pmkisan.gov.in-এ অনলাইনে নিবন্ধন করুন।',
            required_documents: 'আধার কার্ড, জমির মালিকানার নথি, ব্যাংক অ্যাকাউন্টের বিবরণ'
        }
    },
    'ANEMIA_MUKT_BHARAT': {
        en: {
            title: 'Anemia Mukt Bharat',
            short_description: 'National program to reduce anemia in India',
            full_description: 'Anemia Mukt Bharat aims to reduce the prevalence of anemia among women and children through iron supplementation and nutritional counseling.',
            eligibility_criteria: 'All age groups, with focus on women of reproductive age, pregnant women, and children.',
            benefits: 'Free iron-folic acid tablets, Nutritional counseling, Deworming medication, Regular health checkups',
            application_process: 'Visit your nearest Anganwadi center or government hospital. No formal application required.',
            required_documents: 'None required for basic services. Aadhaar card preferred for record keeping.'
        },
        hi: {
            title: 'एनीमिया मुक्त भारत',
            short_description: 'भारत में एनीमिया को कम करने के लिए राष्ट्रीय कार्यक्रम',
            full_description: 'एनीमिया मुक्त भारत का उद्देश्य आयरन सप्लीमेंटेशन और पोषण परामर्श के माध्यम से महिलाओं और बच्चों में एनीमिया की व्यापकता को कम करना है।',
            eligibility_criteria: 'सभी आयु वर्ग, प्रजनन आयु की महिलाओं, गर्भवती महिलाओं और बच्चों पर विशेष ध्यान।',
            benefits: 'मुफ्त आयरन-फोलिक एसिड की गोलियां, पोषण परामर्श, कृमिनाशक दवा, नियमित स्वास्थ्य जांच',
            application_process: 'अपने निकटतम आंगनवाड़ी केंद्र या सरकारी अस्पताल पर जाएं। कोई औपचारिक आवेदन आवश्यक नहीं।',
            required_documents: 'बुनियादी सेवाओं के लिए कोई दस्तावेज आवश्यक नहीं।'
        },
        bn: {
            title: 'অ্যানিমিয়া মুক্ত ভারত',
            short_description: 'ভারতে রক্তাল্পতা কমাতে জাতীয় কর্মসূচি',
            full_description: 'অ্যানিমিয়া মুক্ত ভারত আয়রন সাপ্লিমেন্টেশন এবং পুষ্টি পরামর্শের মাধ্যমে মহিলা ও শিশুদের মধ্যে রক্তাল্পতা কমাতে চায়।',
            eligibility_criteria: 'সকল বয়সের মানুষ, বিশেষ করে প্রজনন বয়সের মহিলা, গর্ভবতী মহিলা এবং শিশু।',
            benefits: 'বিনামূল্যে আয়রন-ফলিক অ্যাসিড ট্যাবলেট, পুষ্টি পরামর্শ',
            application_process: 'আপনার নিকটস্থ অঙ্গনওয়াড়ি কেন্দ্র বা সরকারি হাসপাতালে যান।',
            required_documents: 'মৌলিক সেবার জন্য কোন নথি প্রয়োজন নেই।'
        }
    },
    'SKILL_INDIA': {
        en: {
            title: 'Skill India Mission',
            short_description: 'Empowering youth with industry-relevant skills',
            full_description: 'Skill India Mission aims to train over 40 crore people in India in different skills by 2022. It focuses on providing skill training to youth for better employment opportunities.',
            eligibility_criteria: 'Indian citizens aged 15-45 years. Minimum 8th class pass for most courses.',
            benefits: 'Free skill training courses, Industry-recognized certification, Placement assistance, Financial support during training',
            application_process: 'Register on Skill India portal or visit nearest Pradhan Mantri Kaushal Kendra.',
            required_documents: 'Aadhaar card, Educational certificates, Passport size photographs, Bank account details'
        },
        hi: {
            title: 'स्किल इंडिया मिशन',
            short_description: 'युवाओं को उद्योग-प्रासंगिक कौशल से सशक्त बनाना',
            full_description: 'स्किल इंडिया मिशन का उद्देश्य 2022 तक भारत में 40 करोड़ से अधिक लोगों को विभिन्न कौशलों में प्रशिक्षित करना है।',
            eligibility_criteria: '15-45 वर्ष के भारतीय नागरिक। अधिकांश पाठ्यक्रमों के लिए न्यूनतम 8वीं पास।',
            benefits: 'मुफ्त कौशल प्रशिक्षण पाठ्यक्रम, उद्योग-मान्यता प्राप्त प्रमाणन, प्लेसमेंट सहायता',
            application_process: 'स्किल इंडिया पोर्टल पर पंजीकरण करें या निकटतम प्रधानमंत्री कौशल केंद्र पर जाएं।',
            required_documents: 'आधार कार्ड, शैक्षिक प्रमाण पत्र, पासपोर्ट आकार की तस्वीरें'
        },
        bn: {
            title: 'স্কিল ইন্ডিয়া মিশন',
            short_description: 'যুবকদের শিল্প-প্রাসঙ্গিক দক্ষতায় সক্ষম করা',
            full_description: 'স্কিল ইন্ডিয়া মিশনের লক্ষ্য ২০২২ সালের মধ্যে ভারতে ৪০ কোটিরও বেশি মানুষকে বিভিন্ন দক্ষতায় প্রশিক্ষিত করা।',
            eligibility_criteria: '১৫-৪৫ বছর বয়সী ভারতীয় নাগরিক। বেশিরভাগ কোর্সের জন্য ন্যূনতম অষ্টম শ্রেণী পাস।',
            benefits: 'বিনামূল্যে দক্ষতা প্রশিক্ষণ কোর্স, শিল্প-স্বীকৃত সার্টিফিকেশন',
            application_process: 'স্কিল ইন্ডিয়া পোর্টালে নিবন্ধন করুন।',
            required_documents: 'আধার কার্ড, শিক্ষাগত সার্টিফিকেট, পাসপোর্ট সাইজ ছবি'
        }
    },
    'AYUSHMAN_BHARAT': {
        en: {
            title: 'Ayushman Bharat - PMJAY',
            short_description: 'Health insurance for low income families',
            full_description: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana provides health coverage of Rs. 5 lakh per family per year for secondary and tertiary care hospitalization.',
            eligibility_criteria: 'Families identified based on SECC 2011 database. Priority to vulnerable sections including SC/ST, landless laborers.',
            benefits: 'Rs. 5 lakh health coverage per year, Cashless treatment at empanelled hospitals, Coverage for pre and post hospitalization',
            application_process: 'Check eligibility on mera.pmjay.gov.in. Visit Common Service Center with Aadhaar and ration card.',
            required_documents: 'Aadhaar card, Ration card, SECC identification, Mobile number'
        },
        hi: {
            title: 'आयुष्मान भारत - पीएमजेएवाई',
            short_description: 'कम आय वाले परिवारों के लिए स्वास्थ्य बीमा',
            full_description: 'आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना माध्यमिक और तृतीयक देखभाल अस्पताल में भर्ती के लिए प्रति परिवार प्रति वर्ष 5 लाख रुपये का स्वास्थ्य कवरेज प्रदान करती है।',
            eligibility_criteria: 'SECC 2011 डेटाबेस के आधार पर पहचाने गए परिवार। SC/ST, भूमिहीन मजदूरों सहित कमजोर वर्गों को प्राथमिकता।',
            benefits: 'प्रति वर्ष 5 लाख रुपये का स्वास्थ्य कवरेज, सूचीबद्ध अस्पतालों में कैशलेस उपचार',
            application_process: 'mera.pmjay.gov.in पर पात्रता जांचें। आधार और राशन कार्ड के साथ सामान्य सेवा केंद्र पर जाएं।',
            required_documents: 'आधार कार्ड, राशन कार्ड, SECC पहचान, मोबाइल नंबर'
        },
        bn: {
            title: 'আয়ুষ্মান ভারত - পিএমজেএওয়াই',
            short_description: 'কম আয়ের পরিবারের জন্য স্বাস্থ্য বীমা',
            full_description: 'আয়ুষ্মান ভারত প্রধানমন্ত্রী জন আরোগ্য যোজনা সেকেন্ডারি এবং টার্শিয়ারি কেয়ার হাসপাতালে ভর্তির জন্য পরিবার প্রতি বছরে ৫ লক্ষ টাকা স্বাস্থ্য কভারেজ প্রদান করে।',
            eligibility_criteria: 'SECC 2011 ডাটাবেসের ভিত্তিতে চিহ্নিত পরিবার।',
            benefits: 'বার্ষিক ৫ লক্ষ টাকা স্বাস্থ্য কভারেজ, তালিকাভুক্ত হাসপাতালে ক্যাশলেস চিকিৎসা',
            application_process: 'mera.pmjay.gov.in-এ যোগ্যতা পরীক্ষা করুন।',
            required_documents: 'আধার কার্ড, রেশন কার্ড, SECC পরিচয়, মোবাইল নম্বর'
        }
    }
};

async function seedSchemes() {
    console.log('🌱 Starting database seeding...\n');

    try {
        // First, clear existing data
        console.log('🗑️  Clearing existing data...');
        await supabase.from('scheme_translations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('schemes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // Insert schemes
        console.log('📋 Inserting schemes...');
        for (const scheme of schemes) {
            const { data: schemeData, error: schemeError } = await supabase
                .from('schemes')
                .insert(scheme)
                .select()
                .single();

            if (schemeError) {
                console.error(`❌ Error inserting ${scheme.scheme_code}:`, schemeError.message);
                continue;
            }

            console.log(`✅ Inserted scheme: ${scheme.scheme_code}`);

            // Insert translations
            const schemeTranslations = translations[scheme.scheme_code];
            if (schemeTranslations) {
                for (const [lang, trans] of Object.entries(schemeTranslations)) {
                    const { error: transError } = await supabase
                        .from('scheme_translations')
                        .insert({
                            scheme_id: schemeData.id,
                            language_code: lang,
                            ...trans
                        });

                    if (transError) {
                        console.error(`  ❌ Error inserting ${lang} translation:`, transError.message);
                    } else {
                        console.log(`  ✅ Added ${lang} translation`);
                    }
                }
            }
        }

        // Verify seeding
        console.log('\n📊 Verifying seeded data...');
        const { data: schemeCount } = await supabase.from('schemes').select('*', { count: 'exact' });
        const { data: transCount } = await supabase.from('scheme_translations').select('*', { count: 'exact' });
        
        console.log(`   Schemes: ${schemeCount?.length || 0}`);
        console.log(`   Translations: ${transCount?.length || 0}`);

        console.log('\n🎉 Database seeding completed successfully!');

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

seedSchemes();

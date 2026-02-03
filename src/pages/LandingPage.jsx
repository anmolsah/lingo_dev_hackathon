import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137fec]"></div>
      </div>
    );
  }

  // If user is logged in, don't render (redirect will happen)
  if (user) {
    return null;
  }

  const languages = [
    { 
      name: 'English', 
      flag: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACVPwMTYnffONNj5FfLTYQqeFPx__zsVMAlDir4_gM5AHE_xoFe3TkAyL193gX8R5QyOcPLYC22EME9LSa3JMw-1obrtg4TCsHYoDaopQHs0NlBksSxb-Q1Qz9i1WCok37GeY25MI_Ilpki5U3RHICf2U6R5SfSUy0AfV-FRe5kFuic237wg7KyujRWgcp_Yx02IdKKfmqkgYREJZxSOKcnKoQMxwt4ZTuD4C9JohbuePxn7BSypwNy-97KiaspE9Ng5dDdv12Uhc' 
    },
    { 
      name: 'Spanish', 
      flag: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwhlGzp-oxduCMAZv77TCmpUqxp5BcMH_N-n9uNAWgeLVMgDQ3rTOJt2Ow3R8C23iMNYJBOvxgvdihaBDOREii9glXPVjekzyXQ5tEfyr-Kqqk4tu9Jv_NrnU_sefNsdfSZTOmWKpiSYHb3lISofN2kcGQCzqH7Ez2MlwP2Q9mI0mvlJYGn5zzzK8LnYbk0cEKSQ_sG1EDNhDgOFqFH2dH-JAQYGr8FMnmPyyzpReYEaMWMRWMldVsC6AVKv8MTaMetcsroX4IQpE' 
    },
    { 
      name: 'Japanese', 
      flag: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCu222quRkFjjrLjtQDHZUSIu3kPKJ8OHDU6YSKWsj2HqZeut18Su8ZJvN1Fsn6mhBeKDAAbmWsA0McQglUD9uAREYisPrEagtUzUS6hL6cGdeWgBhmXtPzgo1BDwJA23UnsIkpySBBloftEmaWv71gbEeQYKrUwqTE_ZuDMgjOnUMoYWS4JMiXs35EbrJWEr6jaTs5EDbI5_xfODczucyaCDYlukd2pmCJPssh1QHHhUdD_mWIHyk4pRt_DGWTXZIBWkVcotNm-J8' 
    },
    { 
      name: 'French', 
      flag: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4pEODC_UTUrsYg58zr70CsstoQzj1zMDnm_ANFTSU_PbL8tMBw4XLb6L4DS4WepRpq09DC6Ci7h7DeWcNHghxec1IvmzZgG_jWQbF8TiGT4lKy6KXqIrmm1o4-079JEhqeQxMooxUpbOsz6aqPVzBrucA07B4OpkGasutbrfS-2SqBx6twXsdWycJT05T4rs6fGnl9Sfq7VXvp_TY9rreaCZaenOPFI9fRUNDrGlK5f65JgPRm04jEo6E4K6_IbS1Hof7HY9TSjs' 
    },
    { 
      name: 'German', 
      flag: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpZwUW5s6wVsR31gUPbc8aO82FwTPk5NuLaBDsQfBQ267rxdVTt4UraJUU2qQIuRKWkh2198_cuSrUiYme8iQSolr2oI_X1Q8EpAf38l58Xe2ptsxNDCln2a-sMSWfEXz8e4kC0SeC4NR4gk7cAr9rPDJXUZU9eOL9ukOGfBEJyKklyMnN4MwFVCSz1Z5KCuFPbYIMScbb_kSeJwq4Dyjz6bfUdKGT9dJQgCUWWfE9kNTxlaPLCsSKcw4KfxJEwg940xQXseV5eIo' 
    },
    { 
      name: 'Chinese', 
      flag: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBq8JwCBZZxx9VhdT6UnkEPu_Ut3dyreOUyMJC0D8RbRgUvkyUjPFljYJ91T4B4ni1siOv8Kfal9usxfqZo-Um2qUPympkcipuVQzMXyhAkOibOX0C-mBQjroQUjzjstt8rY17PU_UIYwtF-f_dZGv8IGEEvdhDo6b0MlpGBocThzDoNjbAI33LSFE4Hd0X4oCGqgyvSmynWo01cEVWFEHO-xVH1W9AOywxDkfdhYFFL4KHSd-wsXnVWq0gSljG2IUEOjzUN_PcxzE' 
    },
    { 
      name: 'Portuguese', 
      flag: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVXuhTWUvlgnOkRQQlkpDoxaJ9bOmlKkezCoM6MjXrTGFuH6jfH-SW7FJGUKTBlLYeIT3kmhPxXTV4TrJvT2guvvxvokVR1uTlGpcszRN546sA9MogrZ49Ctogyf7qj0DRS0luoQMUhqLjrGl3HTyrmxUw_v5n-T-13QtV-1EdUsTpYFEqoQ1pUmGImaQzepEBQjFl_sY3rEKq91Iljrq_Wl1j6sJVtASjwBfOZ0l30trnMZBDO2vSMHhYrZ7x6HxEkQNUwXU-TbA' 
    },
  ];

  const heroImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXiOqUvPJlboZzeXbcJINJ5ESaaN7EMoleT0kflg9xCw9oaaxwsc47Wd4J7lwDOL_VNwQrdYRNXKwgsIOZwWxy6UCqbmHepjKV4fuyQQ3lv_RHkKLpZNtd_dTCrIf8dngPiZ_Zb8uxw4TJkOfswG98UCD7I7cV53jMXQtDFpWlQtNJq7vfwIojbBxEjMPUCalVjAqvRqiOzeKvG92Lvwfpc_rbk-k2FyRvnugUJDoCim4Sdys33HBPCPOUiJTwNfNXd7sOGqm7njY';

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f8fafc] font-['Inter',sans-serif] text-slate-900 antialiased">
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      {/* Decorative Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#137fec]/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-400/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-[10px] border-b border-white/50">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex w-8 h-8 items-center justify-center rounded-lg bg-[#137fec] text-white">
              <span className="material-symbols-outlined text-xl">language</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">PolyConnect</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-sm font-medium text-slate-600 hover:text-[#137fec] transition-colors" href="#">About</a>
            <a className="text-sm font-medium text-slate-600 hover:text-[#137fec] transition-colors" href="#">Community</a>
            <a className="text-sm font-medium text-slate-600 hover:text-[#137fec] transition-colors" href="#">Blog</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link 
              to="/login"
              className="hidden text-sm font-medium text-slate-700 hover:text-[#137fec] sm:block"
            >
              Log In
            </Link>
            <Link 
              to="/signup"
              className="flex h-10 items-center justify-center rounded-lg bg-[#137fec] px-5 text-sm font-bold text-white transition-transform hover:scale-105 hover:shadow-lg hover:shadow-[#137fec]/30"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-col flex-grow">
        {/* Hero Section */}
        <section className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-[1280px]">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
              <div className="max-w-2xl text-center lg:text-left">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                  <span className="block">Ask Questions in</span>
                  <span className="block text-[#137fec]">Any Language</span>
                </h1>
                <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                  Connect with students and developers worldwide. Break language barriers with our AI-powered translation and learn faster than ever before.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                  <Link 
                    to="/signup"
                    className="flex h-12 items-center justify-center rounded-lg bg-[#137fec] px-8 text-base font-bold text-white shadow-lg shadow-[#137fec]/25 transition-all hover:bg-blue-600 hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Get Started
                  </Link>
                  <Link 
                    to="/login"
                    className="flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-bold text-slate-700 border border-slate-200 shadow-sm transition-all hover:bg-slate-50"
                  >
                    Browse Topics
                  </Link>
                </div>
              </div>
              <div className="relative lg:block">
                {/* Abstract Illustration */}
                <div className="relative w-full aspect-square max-w-lg mx-auto lg:mr-0 bg-white/70 backdrop-blur-[10px] border border-white/50 rounded-2xl p-4 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#137fec]/5 to-purple-500/5"></div>
                  <div 
                    className="h-full w-full rounded-xl bg-cover bg-center" 
                    style={{ backgroundImage: `url('${heroImage}')` }}
                  ></div>
                  {/* Floating UI Element Mockups */}
                  <div className="absolute bottom-8 left-8 right-8 bg-white/70 backdrop-blur-[10px] border border-white/50 rounded-lg p-4 shadow-lg animate-pulse">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#137fec]/20 flex items-center justify-center text-[#137fec]">
                        <span className="material-symbols-outlined">translate</span>
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                        <div className="h-2 w-1/2 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1280px]">
            <div className="bg-white/70 backdrop-blur-[10px] border border-slate-200/50 rounded-xl p-8 shadow-sm">
              <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <p className="text-4xl font-black text-slate-900 tracking-tight">10k+</p>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Questions Solved</p>
                </div>
                <div className="flex flex-col gap-1 border-y border-slate-200 py-4 sm:border-y-0 sm:border-x">
                  <p className="text-4xl font-black text-slate-900 tracking-tight">5,000+</p>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Active Members</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-4xl font-black text-slate-900 tracking-tight">50+</p>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Languages Supported</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Language Carousel Section */}
        <section className="py-12 overflow-hidden bg-white/50">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 mb-6 text-center">
            <h3 className="text-lg font-semibold text-slate-900">Trusted by learners from 100+ countries</h3>
          </div>
          <div className="relative w-full overflow-hidden whitespace-nowrap py-4">
            <div className="flex justify-center gap-6 px-4 flex-wrap">
              {languages.map((lang, index) => (
                <div 
                  key={index}
                  className="flex w-40 flex-col items-center gap-3 rounded-xl bg-white p-4 shadow-sm border border-slate-100 transition-transform hover:-translate-y-1"
                >
                  <div 
                    className="w-12 h-12 rounded-full bg-cover bg-center shadow-inner" 
                    style={{ backgroundImage: `url('${lang.flag}')` }}
                  ></div>
                  <span className="font-bold text-slate-700">{lang.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-12 max-w-3xl">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Why PolyConnect?
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Our platform provides the tools you need to share knowledge without borders. Built for inclusivity and technical precision.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="group relative flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="flex w-14 h-14 items-center justify-center rounded-xl bg-blue-50 text-[#137fec] transition-colors group-hover:bg-[#137fec] group-hover:text-white">
                  <span className="material-symbols-outlined text-3xl">translate</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Seamless Translation</h3>
                  <p className="mt-2 text-slate-500">
                    Real-time AI translation ensures your questions are understood by everyone, preserving technical context.
                  </p>
                </div>
              </div>
              {/* Feature 2 */}
              <div className="group relative flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="flex w-14 h-14 items-center justify-center rounded-xl bg-blue-50 text-[#137fec] transition-colors group-hover:bg-[#137fec] group-hover:text-white">
                  <span className="material-symbols-outlined text-3xl">code</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Developer Focused</h3>
                  <p className="mt-2 text-slate-500">
                    Built-in syntax highlighting for 100+ languages and markdown support for precise technical queries.
                  </p>
                </div>
              </div>
              {/* Feature 3 */}
              <div className="group relative flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="flex w-14 h-14 items-center justify-center rounded-xl bg-blue-50 text-[#137fec] transition-colors group-hover:bg-[#137fec] group-hover:text-white">
                  <span className="material-symbols-outlined text-3xl">verified_user</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Community Verified</h3>
                  <p className="mt-2 text-slate-500">
                    Answers are peer-reviewed by community experts to ensure accuracy and reduce misinformation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white pt-16 pb-8">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#137fec] text-2xl">language</span>
                <span className="text-xl font-bold text-slate-900">PolyConnect</span>
              </div>
              <p className="text-sm text-slate-500">
                Connecting the world through knowledge, one question at a time.
              </p>
            </div>
            {/* Links 1 */}
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-slate-900">Platform</h4>
              <ul className="flex flex-col gap-2">
                <li><a className="text-sm text-slate-500 hover:text-[#137fec]" href="#">Browse Topics</a></li>
                <li><a className="text-sm text-slate-500 hover:text-[#137fec]" href="#">Community Guidelines</a></li>
                <li><a className="text-sm text-slate-500 hover:text-[#137fec]" href="#">Leaderboard</a></li>
              </ul>
            </div>
            {/* Links 2 */}
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-slate-900">Company</h4>
              <ul className="flex flex-col gap-2">
                <li><a className="text-sm text-slate-500 hover:text-[#137fec]" href="#">About Us</a></li>
                <li><a className="text-sm text-slate-500 hover:text-[#137fec]" href="#">Careers</a></li>
                <li><a className="text-sm text-slate-500 hover:text-[#137fec]" href="#">Contact</a></li>
              </ul>
            </div>
            {/* Newsletter */}
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-slate-900">Stay Updated</h4>
              <p className="text-sm text-slate-500">Join our newsletter for weekly top questions.</p>
              <form className="flex flex-col gap-2">
                <input 
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-[#137fec] focus:outline-none focus:ring-2 focus:ring-[#137fec]/20" 
                  placeholder="Enter your email" 
                  type="email"
                />
                <button 
                  className="w-full rounded-lg bg-[#137fec] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-600" 
                  type="submit"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-100 pt-8">
            <p className="text-center text-sm text-slate-400">
              © 2023 PolyConnect Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

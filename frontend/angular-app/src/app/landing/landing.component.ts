import { Component, signal, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

interface WaitlistEntry {
  hospitalName: string;
  fullName: string;
  email: string;
  phone: string;
  businessType: string;
  submittedAt: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="zv-page">
    <!-- ============= NAVBAR ============= -->
    <header class="zv-nav" [class.scrolled]="scrolled()">
      <div class="zv-container nav-inner">
        <div class="brand" (click)="scrollTo('home')">
          <div class="logo">
            <svg viewBox="0 0 40 40" width="36" height="36">
              <defs>
                <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#2196F3"/>
                  <stop offset="100%" stop-color="#22C55E"/>
                </linearGradient>
              </defs>
              <path d="M8 4 L32 4 L36 12 L20 36 L4 12 Z" fill="url(#lg1)"/>
              <path d="M20 14 L20 26 M14 20 L26 20" stroke="white" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="brand-text">
            <div class="brand-name">ZYVRAA</div>
            <div class="brand-tag">Healthcare Management Simplified</div>
          </div>
        </div>

        <nav class="nav-menu" [class.open]="menuOpen()">
          <a (click)="scrollTo('home')"     [class.active]="activeSection() === 'home'">Home</a>
          <a (click)="scrollTo('features')" [class.active]="activeSection() === 'features'">Features</a>
          <a (click)="scrollTo('modules')"  [class.active]="activeSection() === 'modules'">Modules</a>
          <a (click)="scrollTo('ecosystem')"[class.active]="activeSection() === 'ecosystem'">Ecosystem</a>
          <a (click)="scrollTo('pricing')"  [class.active]="activeSection() === 'pricing'">Pricing</a>
          <a (click)="scrollTo('about')"    [class.active]="activeSection() === 'about'">About Us</a>
          <a (click)="scrollTo('contact')"  [class.active]="activeSection() === 'contact'">Contact</a>
        </nav>

        <div class="nav-cta">
          <button class="btn btn-soft">COMING SOON</button>
          <button class="btn btn-primary" (click)="scrollTo('contact')">Book a Demo</button>
          <button class="btn btn-ghost" (click)="goLogin()">Login</button>
          <button class="hamburger" (click)="menuOpen.set(!menuOpen())">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>

    <!-- ============= HERO ============= -->
    <section id="home" class="hero">
      <div class="zv-container hero-inner">
        <div class="hero-left">
          <span class="pill">
            <span class="dot"></span> COMING SOON
          </span>
          <h1 class="hero-title">
            One Platform for the <br/>
            Entire <span class="text-blue">Healthcare</span><br/>
            <span class="text-green">Ecosystem</span>
          </h1>
          <p class="hero-desc">
            ZYVRAA connects Hospitals, Laboratories, Medical Stores,
            Suppliers, Doctors & Patients into one smart platform
            to manage everything, effortlessly.
          </p>
          <div class="hero-cta">
            <button class="btn btn-primary big" (click)="scrollTo('contact')">
              Book Live Demo <span class="arrow">→</span>
            </button>
            <button class="btn btn-outline-green big" (click)="scrollTo('contact')">
              Join Early Access <span class="arrow">→</span>
            </button>
          </div>

          <div class="hero-features">
            <div class="feat" *ngFor="let f of heroFeatures">
              <div class="feat-icon" [style.background]="f.bg">{{ f.icon }}</div>
              <div>
                <div class="feat-title">{{ f.title }}</div>
                <div class="feat-sub">{{ f.sub }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-right">
          <div class="floating-tag tag-1">
            <span class="tag-icon">🏥</span> Hospital
          </div>
          <div class="floating-tag tag-2">
            <span class="tag-icon">🧪</span> Laboratory
          </div>
          <div class="floating-tag tag-3">
            <span class="tag-icon">💊</span> Pharmacy
          </div>

          <div class="dashboard-mock">
            <div class="dash-sidebar">
              <div class="dash-brand">
                <span class="logo-mini">⚕</span> ZYVRAA
              </div>
              <div class="dash-menu">
                <div class="dm-item active">📊 Dashboard</div>
                <div class="dm-item">👥 Patients</div>
                <div class="dm-item">📅 Appointments</div>
                <div class="dm-item">👨‍⚕️ Doctors</div>
                <div class="dm-item">🧪 Laboratory</div>
                <div class="dm-item">💊 Pharmacy</div>
                <div class="dm-item">📦 Inventory</div>
                <div class="dm-item">💰 Billing</div>
                <div class="dm-item">📈 Reports</div>
                <div class="dm-item">💵 Finance</div>
                <div class="dm-item">⚙️ Settings</div>
              </div>
            </div>
            <div class="dash-main">
              <div class="dash-header">
                <h3>Dashboard</h3>
                <div class="header-right">
                  <span class="period">This Month ▾</span>
                  <div class="avatars">
                    <span class="av av-1">😊</span>
                    <span class="av av-2">👤</span>
                    <span class="av av-3">👨</span>
                  </div>
                </div>
              </div>
              <div class="kpi-grid">
                <div class="kpi" *ngFor="let k of kpis">
                  <div class="kpi-label">{{ k.label }} {{ k.iconText }}</div>
                  <div class="kpi-value" [style.color]="k.color">{{ k.value }}</div>
                  <div class="kpi-trend">↑ {{ k.trend }}</div>
                </div>
              </div>
              <div class="charts-row">
                <div class="chart-card">
                  <div class="chart-title">Revenue Overview</div>
                  <div class="chart-area">
                    <svg viewBox="0 0 300 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="rev-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stop-color="#2196F3" stop-opacity="0.3"/>
                          <stop offset="100%" stop-color="#2196F3" stop-opacity="0"/>
                        </linearGradient>
                      </defs>
                      <path d="M0,90 L40,75 L80,80 L120,55 L160,50 L200,30 L240,35 L300,15 L300,120 L0,120 Z" fill="url(#rev-grad)"/>
                      <path d="M0,90 L40,75 L80,80 L120,55 L160,50 L200,30 L240,35 L300,15" stroke="#2196F3" stroke-width="2" fill="none"/>
                      <circle cx="200" cy="30" r="4" fill="#2196F3"/>
                    </svg>
                    <div class="chart-tag">Revenue ₹45,75,000</div>
                  </div>
                  <div class="chart-x">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                </div>
                <div class="chart-card">
                  <div class="chart-title">Recent Activities</div>
                  <div class="activity" *ngFor="let a of activities">
                    <div class="act-dot" [style.background]="a.color"></div>
                    <div class="act-text">{{ a.text }}</div>
                    <div class="act-time">{{ a.time }}</div>
                  </div>
                  <a class="view-all">View all</a>
                </div>
              </div>
            </div>
          </div>

          <div class="floating-tag tag-bottom tag-suppliers">
            <span class="tag-icon">🚚</span> Suppliers
          </div>
          <div class="floating-tag tag-bottom tag-doctors">
            <span class="tag-icon">👨‍⚕️</span> Doctors
          </div>
          <div class="floating-tag tag-bottom tag-patients">
            <span class="tag-icon">👥</span> Patients
          </div>
        </div>
      </div>

      <!-- Trust Bar -->
      <div class="zv-container">
        <div class="trust-bar">
          <div class="trust-label">Trusted by Future-Ready Healthcare Businesses</div>
          <div class="trust-stats">
            <div class="ts" *ngFor="let s of trustStats">
              <div class="ts-num">{{ s.num }}</div>
              <div class="ts-label">{{ s.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============= ECOSYSTEM ============= -->
    <section id="ecosystem" class="ecosystem">
      <div class="zv-container">
        <h2 class="section-title light">A Connected Healthcare Ecosystem</h2>
        <div class="eco-diagram">
          <div class="eco-side left">
            <div class="eco-card" *ngFor="let e of ecoLeft">
              <div class="eco-text">
                <h4>{{ e.title }}</h4>
                <p>{{ e.desc }}</p>
              </div>
              <div class="eco-icon">{{ e.icon }}</div>
            </div>
          </div>

          <div class="eco-center">
            <svg class="eco-lines" viewBox="0 0 600 400">
              <g stroke="rgba(34,197,94,0.4)" stroke-width="1" stroke-dasharray="4 4" fill="none">
                <path d="M150,80 L300,200"/>
                <path d="M150,200 L300,200"/>
                <path d="M150,320 L300,200"/>
                <path d="M450,80 L300,200"/>
                <path d="M450,200 L300,200"/>
                <path d="M450,320 L300,200"/>
              </g>
            </svg>
            <div class="eco-hub">
              <div class="hub-logo">
                <svg viewBox="0 0 40 40" width="60" height="60">
                  <path d="M8 4 L32 4 L36 12 L20 36 L4 12 Z" fill="white"/>
                  <text x="20" y="22" text-anchor="middle" font-size="8" font-weight="bold" fill="#0f2a4a">⚕+</text>
                </svg>
              </div>
              <div class="hub-name">ZYVRAA</div>
              <div class="hub-tag">CORE PLATFORM</div>
            </div>
          </div>

          <div class="eco-side right">
            <div class="eco-card" *ngFor="let e of ecoRight">
              <div class="eco-icon">{{ e.icon }}</div>
              <div class="eco-text">
                <h4>{{ e.title }}</h4>
                <p>{{ e.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============= MODULES ============= -->
    <section id="modules" class="modules">
      <div class="zv-container">
        <h2 class="section-title">Powerful Modules. One Unified Platform.</h2>
        <div class="modules-grid">
          <div class="module-card" *ngFor="let m of modules; let i = index" (click)="selectModule(i)">
            <div class="m-icon" [style.background]="m.iconBg">{{ m.icon }}</div>
            <h3>{{ m.title }}</h3>
            <p>{{ m.desc }}</p>
            <div class="m-preview" [style.background]="m.previewBg">
              <div class="m-preview-row" *ngFor="let r of m.rows">
                <span class="dot" [style.background]="m.dotColor"></span>
                <span class="line"></span>
              </div>
              <div class="m-chart" *ngIf="m.hasChart">
                <svg viewBox="0 0 100 30">
                  <rect x="5"  y="15" width="8" height="15" [attr.fill]="m.dotColor"/>
                  <rect x="20" y="8"  width="8" height="22" [attr.fill]="m.dotColor"/>
                  <rect x="35" y="12" width="8" height="18" [attr.fill]="m.dotColor"/>
                  <rect x="50" y="5"  width="8" height="25" [attr.fill]="m.dotColor"/>
                  <rect x="65" y="10" width="8" height="20" [attr.fill]="m.dotColor"/>
                  <rect x="80" y="3"  width="8" height="27" [attr.fill]="m.dotColor"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============= WHY / AI ============= -->
    <section id="features" class="features">
      <div class="zv-container features-grid">
        <div class="compare-card">
          <h3 class="compare-title">Why <span class="text-blue">ZYVRA</span><span class="text-green">A</span> is Different?</h3>
          <div class="compare-grid">
            <div class="compare-col">
              <div class="cc-head">Traditional Systems</div>
              <div class="cc-item bad" *ngFor="let t of traditionalPoints">
                <span class="x">✕</span> {{ t }}
              </div>
            </div>
            <div class="compare-vs">VS</div>
            <div class="compare-col">
              <div class="cc-head zv">ZYVRAA Platform</div>
              <div class="cc-item good" *ngFor="let z of zyvraaPoints">
                <span class="check">✓</span> {{ z }}
              </div>
            </div>
          </div>
        </div>

        <div class="ai-card">
          <h3 class="ai-title">AI-Powered. Future-Ready.</h3>
          <div class="ai-features">
            <div class="ai-feat" *ngFor="let a of aiFeatures">
              <div class="ai-icon" [style.background]="a.bg">{{ a.icon }}</div>
              <div>
                <h4>{{ a.title }}</h4>
                <p>{{ a.desc }}</p>
              </div>
            </div>
          </div>
          <div class="ai-visual">
            <div class="ai-chip">AI</div>
            <div class="ai-rays"></div>
          </div>
        </div>
      </div>

      <div class="zv-container stats-security-grid">
        <div class="stats-banner">
          <div class="sb-stat" *ngFor="let s of bannerStats">
            <div class="sb-num">{{ s.num }}</div>
            <div class="sb-label">{{ s.label }}</div>
          </div>
        </div>

        <div class="security-card">
          <h3>Enterprise-Grade Security</h3>
          <div class="sec-grid">
            <div class="sec-item" *ngFor="let s of security">
              <div class="sec-icon">{{ s.icon }}</div>
              <div class="sec-label">{{ s.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============= TESTIMONIALS / EARLY ACCESS ============= -->
    <section id="about" class="testimonials">
      <div class="zv-container testimonial-grid">
        <div class="testi-left">
          <h2 class="section-title">Built for the Next Generation of Healthcare</h2>
          <div class="testi-cards">
            <div class="testi-card" *ngFor="let t of testimonials">
              <div class="quote">"</div>
              <p class="quote-text">{{ t.quote }}</p>
              <div class="testi-foot">
                <div class="testi-avatar" [style.background]="t.color">{{ t.initials }}</div>
                <div>
                  <div class="testi-name">{{ t.name }}</div>
                  <div class="testi-role">{{ t.role }}</div>
                </div>
              </div>
              <div class="testi-stars">★ ★ ★ ★ ★</div>
            </div>
          </div>
        </div>

        <div class="future-card">
          <h3>Be Part of the Future of Healthcare</h3>
          <div class="future-cta">
            <button class="btn btn-green big" (click)="scrollTo('contact')">Join Early Access</button>
            <button class="btn btn-outline-white big" (click)="scrollTo('contact')">Request Demo</button>
          </div>
          <div class="early-count">
            <span class="ec-num">{{ earlyCount() }}+</span>
            <div class="ec-text">
              <div>Healthcare Professionals</div>
              <div>Joined Early Access</div>
            </div>
            <div class="ec-avatars">
              <span class="ec-av">👨</span>
              <span class="ec-av">👩</span>
              <span class="ec-av">🧑</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============= CONTACT FORM ============= -->
    <section id="contact" class="contact">
      <div class="zv-container contact-grid">
        <div class="contact-left">
          <h2>Ready to Digitize Your<br/>Healthcare Operations?</h2>
          <p>Join the Waitlist & Get Early Access<br/>to ZYVRAA Healthcare Platform</p>
          <div class="pulse">
            <svg viewBox="0 0 300 50" preserveAspectRatio="none">
              <polyline points="0,25 30,25 40,10 50,40 60,5 70,45 80,25 300,25" stroke="#22C55E" stroke-width="2" fill="none"/>
            </svg>
          </div>
        </div>

        <form class="contact-form" (ngSubmit)="submitForm()" #f="ngForm">
          <div class="row-2">
            <div class="field">
              <label>Hospital / Organization Name</label>
              <input type="text" name="hospital" [(ngModel)]="form.hospitalName" placeholder="Your Hospital Name" required/>
            </div>
            <div class="field">
              <label>Your Name</label>
              <input type="text" name="fullName" [(ngModel)]="form.fullName" placeholder="Full Name" required/>
            </div>
            <div class="field">
              <label>Email</label>
              <input type="email" name="email" [(ngModel)]="form.email" placeholder="you@example.com" required/>
            </div>
            <div class="field">
              <label>Phone Number</label>
              <input type="tel" name="phone" [(ngModel)]="form.phone" placeholder="+91 98765 43210" required/>
            </div>
            <div class="field">
              <label>Business Type</label>
              <select name="businessType" [(ngModel)]="form.businessType" required>
                <option value="">Select Type</option>
                <option value="Hospital">Hospital</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Clinic">Clinic</option>
                <option value="Supplier">Supplier</option>
              </select>
            </div>
            <div class="field full">
              <button class="btn btn-green big" type="submit" [disabled]="submitting()">
                {{ submitting() ? 'Submitting...' : 'Join Early Access' }} <span class="arrow">→</span>
              </button>
            </div>
          </div>
          <div *ngIf="successMsg()" class="success-msg">{{ successMsg() }}</div>
        </form>
      </div>
    </section>

    <!-- ============= FOOTER ============= -->
    <footer class="footer">
      <div class="zv-container footer-grid">
        <div class="f-col brand-col">
          <div class="brand">
            <div class="logo">
              <svg viewBox="0 0 40 40" width="36" height="36">
                <path d="M8 4 L32 4 L36 12 L20 36 L4 12 Z" fill="url(#lg1)"/>
              </svg>
            </div>
            <div class="brand-text">
              <div class="brand-name">ZYVRAA</div>
              <div class="brand-tag">Healthcare Management Simplified</div>
            </div>
          </div>
          <p class="f-blurb">
            Connecting Hospitals, Laboratories, Pharmacies,
            Suppliers, Doctors & Patients into one smart
            healthcare ecosystem.
          </p>
        </div>

        <div class="f-col">
          <h4>Product</h4>
          <a (click)="scrollTo('features')">Features</a>
          <a (click)="scrollTo('modules')">Modules</a>
          <a (click)="scrollTo('ecosystem')">Ecosystem</a>
          <a (click)="scrollTo('contact')">Security</a>
          <a (click)="scrollTo('contact')">Integrations</a>
        </div>

        <div class="f-col">
          <h4>Industries</h4>
          <a>Hospitals</a>
          <a>Laboratories</a>
          <a>Pharmacies</a>
          <a>Suppliers / Agencies</a>
          <a>Healthcare Networks</a>
        </div>

        <div class="f-col">
          <h4>Company</h4>
          <a>About Us</a>
          <a>Why ZYVRAA</a>
          <a>Careers</a>
          <a>Contact Us</a>
          <a>Blog</a>
        </div>

        <div class="f-col">
          <h4>Support</h4>
          <a>Help Center</a>
          <a>Documentation</a>
          <a>Privacy Policy</a>
          <a>Terms of Use</a>
        </div>

        <div class="f-col subscribe">
          <h4>Stay Updated</h4>
          <p>Subscribe to get the latest updates about ZYVRAA.</p>
          <div class="sub-row">
            <input type="email" placeholder="Enter your email" [(ngModel)]="subscribeEmail" name="sub"/>
            <button class="btn btn-green sm" (click)="subscribe()">→</button>
          </div>
        </div>
      </div>
      <div class="copy">
        © 2026 ZYVRAA. All rights reserved.
      </div>
    </footer>
  </div>
  `,
  styles: [`
    :host { display: block; }
    .zv-page { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f2a4a; background: #fff; overflow-x: hidden; }
    .zv-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    .text-blue { color: #2196F3; }
    .text-green { color: #22C55E; }

    /* ===== Navbar ===== */
    .zv-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); transition: all .2s; padding: 14px 0; border-bottom: 1px solid transparent; }
    .zv-nav.scrolled { box-shadow: 0 2px 12px rgba(15,42,74,0.08); border-color: #eef2f7; }
    .nav-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
    .brand { display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .brand-name { font-weight: 800; font-size: 1.25rem; color: #0f2a4a; letter-spacing: 1px; }
    .brand-tag { font-size: .65rem; color: #64748b; }
    .nav-menu { display: flex; gap: 26px; }
    .nav-menu a { font-size: .9rem; color: #475569; cursor: pointer; font-weight: 500; transition: color .15s; }
    .nav-menu a:hover, .nav-menu a.active { color: #2196F3; }
    .nav-cta { display: flex; gap: 10px; align-items: center; }
    .hamburger { display: none; background: none; border: none; flex-direction: column; gap: 4px; cursor: pointer; }
    .hamburger span { width: 22px; height: 2px; background: #0f2a4a; }

    /* ===== Buttons ===== */
    .btn { padding: 8px 18px; border-radius: 30px; font-weight: 600; font-size: .85rem; cursor: pointer; border: none; transition: all .2s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
    .btn.big { padding: 13px 26px; font-size: .95rem; }
    .btn.sm { padding: 8px 14px; font-size: .85rem; }
    .btn-primary { background: #2196F3; color: #fff; }
    .btn-primary:hover { background: #1976D2; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(33,150,243,.3); }
    .btn-soft { background: #fff; color: #2196F3; border: 1px solid #2196F3; }
    .btn-soft:hover { background: #f0f9ff; }
    .btn-ghost { background: transparent; color: #475569; border: 1px solid #e2e8f0; }
    .btn-ghost:hover { background: #f8fafc; color: #0f2a4a; }
    .btn-outline-green { background: #fff; color: #22C55E; border: 2px solid #22C55E; }
    .btn-outline-green:hover { background: #f0fdf4; }
    .btn-outline-white { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,.4); }
    .btn-outline-white:hover { background: rgba(255,255,255,.1); }
    .btn-green { background: #22C55E; color: #fff; }
    .btn-green:hover { background: #16A34A; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(34,197,94,.3); }
    .arrow { display: inline-block; transition: transform .2s; }
    .btn:hover .arrow { transform: translateX(3px); }

    /* ===== Hero ===== */
    .hero { padding: 140px 0 60px; background: linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%); position: relative; overflow: hidden; }
    .hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle, #c7d2fe 1px, transparent 1px); background-size: 30px 30px; opacity: .3; }
    .hero-inner { display: grid; grid-template-columns: 1fr 1.1fr; gap: 40px; align-items: center; position: relative; }
    .pill { display: inline-flex; align-items: center; gap: 8px; background: #fff; padding: 6px 14px; border-radius: 20px; font-size: .7rem; font-weight: 700; color: #475569; letter-spacing: 1.5px; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
    .pill .dot { width: 6px; height: 6px; border-radius: 50%; background: #22C55E; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }
    .hero-title { font-size: 3.4rem; font-weight: 800; line-height: 1.1; margin: 16px 0 18px; }
    .hero-desc { font-size: 1rem; color: #64748b; max-width: 480px; margin-bottom: 26px; line-height: 1.6; }
    .hero-cta { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 36px; }
    .hero-features { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; max-width: 580px; }
    .feat { display: flex; align-items: center; gap: 8px; }
    .feat-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem; color: #fff; }
    .feat-title { font-weight: 700; font-size: .8rem; }
    .feat-sub { font-size: .68rem; color: #94a3b8; }

    /* Hero Right: Dashboard mockup */
    .hero-right { position: relative; }
    .dashboard-mock { background: #fff; border-radius: 14px; box-shadow: 0 12px 40px rgba(15,42,74,.15); display: grid; grid-template-columns: 130px 1fr; overflow: hidden; min-height: 380px; }
    .dash-sidebar { background: linear-gradient(180deg, #1e3a8a 0%, #0f2a4a 100%); padding: 14px 10px; color: #cfe4ff; }
    .dash-brand { display: flex; align-items: center; gap: 6px; font-weight: 800; font-size: .85rem; margin-bottom: 14px; }
    .logo-mini { background: #fff; color: #0f2a4a; width: 18px; height: 18px; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; font-size: .7rem; }
    .dm-item { font-size: .68rem; padding: 5px 8px; border-radius: 5px; margin-bottom: 2px; cursor: pointer; opacity: .8; }
    .dm-item.active { background: rgba(255,255,255,.15); color: #fff; opacity: 1; font-weight: 700; }
    .dash-main { padding: 14px; }
    .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .dash-header h3 { margin: 0; font-size: 1.05rem; }
    .header-right { display: flex; align-items: center; gap: 10px; }
    .period { background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-size: .7rem; color: #475569; }
    .avatars .av { display: inline-flex; width: 22px; height: 22px; background: #e0e7ff; border-radius: 50%; align-items: center; justify-content: center; font-size: .65rem; margin-left: -4px; border: 2px solid #fff; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px; }
    .kpi { background: #f8fafc; padding: 10px; border-radius: 8px; }
    .kpi-label { font-size: .6rem; color: #64748b; margin-bottom: 3px; }
    .kpi-value { font-size: 1rem; font-weight: 800; }
    .kpi-trend { font-size: .58rem; color: #22C55E; }
    .charts-row { display: grid; grid-template-columns: 1.4fr 1fr; gap: 10px; }
    .chart-card { background: #f8fafc; border-radius: 8px; padding: 10px; }
    .chart-title { font-size: .72rem; font-weight: 700; margin-bottom: 6px; }
    .chart-area { position: relative; height: 80px; }
    .chart-area svg { width: 100%; height: 100%; }
    .chart-tag { position: absolute; top: 8px; right: 8px; background: #fff; padding: 3px 7px; border-radius: 5px; font-size: .58rem; font-weight: 700; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    .chart-x { display: flex; justify-content: space-between; font-size: .55rem; color: #94a3b8; margin-top: 4px; }
    .activity { display: grid; grid-template-columns: 10px 1fr auto; gap: 6px; align-items: center; padding: 4px 0; font-size: .58rem; }
    .act-dot { width: 6px; height: 6px; border-radius: 50%; }
    .act-text { color: #475569; }
    .act-time { color: #94a3b8; font-size: .55rem; }
    .view-all { display: block; text-align: center; color: #2196F3; font-size: .65rem; font-weight: 700; margin-top: 6px; cursor: pointer; }

    .floating-tag { position: absolute; background: #fff; padding: 7px 14px; border-radius: 30px; font-size: .8rem; font-weight: 700; color: #0f2a4a; box-shadow: 0 4px 14px rgba(15,42,74,.12); display: inline-flex; align-items: center; gap: 6px; z-index: 2; animation: float 4s ease-in-out infinite; }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    .tag-1 { top: -10px; left: 5%; animation-delay: 0s; }
    .tag-2 { top: -10px; left: 38%; animation-delay: .5s; }
    .tag-3 { top: -10px; right: 5%; animation-delay: 1s; }
    .tag-bottom { bottom: -16px; }
    .tag-suppliers { left: 5%; animation-delay: 1.5s; }
    .tag-doctors { left: 38%; animation-delay: 2s; }
    .tag-patients { right: 5%; animation-delay: 2.5s; }

    /* Trust bar */
    .trust-bar { margin-top: 64px; background: #fff; border-radius: 14px; padding: 22px 26px; box-shadow: 0 4px 20px rgba(15,42,74,.08); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px; }
    .trust-label { font-size: .75rem; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; }
    .trust-stats { display: flex; gap: 36px; }
    .ts-num { font-size: 1.8rem; font-weight: 800; color: #2196F3; }
    .ts-label { font-size: .8rem; color: #64748b; }

    /* ===== Section title ===== */
    .section-title { font-size: 2.2rem; font-weight: 800; text-align: center; margin-bottom: 40px; }
    .section-title.light { color: #fff; }

    /* ===== Ecosystem ===== */
    .ecosystem { background: linear-gradient(135deg, #0f2a4a 0%, #1e3a8a 100%); padding: 70px 0; color: #fff; position: relative; }
    .eco-diagram { display: grid; grid-template-columns: 1fr 1.2fr 1fr; gap: 24px; align-items: center; }
    .eco-side { display: flex; flex-direction: column; gap: 26px; }
    .eco-card { display: flex; align-items: center; gap: 14px; color: #fff; }
    .eco-side.left .eco-card { justify-content: flex-end; text-align: right; }
    .eco-side.right .eco-card { justify-content: flex-start; text-align: left; }
    .eco-card h4 { margin: 0 0 4px; font-size: 1.05rem; }
    .eco-card p { margin: 0; font-size: .8rem; color: #cbd5e1; }
    .eco-icon { width: 54px; height: 54px; background: rgba(255,255,255,.08); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border: 2px solid rgba(255,255,255,.15); flex-shrink: 0; }
    .eco-center { position: relative; min-height: 400px; display: flex; align-items: center; justify-content: center; }
    .eco-lines { position: absolute; inset: 0; width: 100%; height: 100%; }
    .eco-hub { background: #fff; border-radius: 50%; width: 180px; height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #0f2a4a; box-shadow: 0 20px 60px rgba(0,0,0,.3); position: relative; z-index: 2; }
    .hub-name { font-weight: 800; font-size: 1.3rem; margin-top: 4px; }
    .hub-tag { font-size: .65rem; color: #64748b; letter-spacing: 2px; }

    /* ===== Modules ===== */
    .modules { padding: 70px 0; background: #f8fafc; }
    .modules-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
    .module-card { background: #fff; border-radius: 14px; padding: 22px; transition: all .25s; cursor: pointer; border: 1px solid #e2e8f0; }
    .module-card:hover { transform: translateY(-6px); box-shadow: 0 14px 30px rgba(15,42,74,.1); border-color: #2196F3; }
    .m-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin-bottom: 14px; color: #fff; }
    .module-card h3 { margin: 0 0 8px; font-size: 1.05rem; }
    .module-card p { margin: 0 0 16px; font-size: .85rem; color: #64748b; line-height: 1.5; }
    .m-preview { border-radius: 8px; padding: 12px; min-height: 90px; }
    .m-preview-row { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
    .m-preview-row .dot { width: 6px; height: 6px; border-radius: 50%; }
    .m-preview-row .line { flex: 1; height: 4px; background: rgba(0,0,0,.1); border-radius: 2px; }
    .m-chart { margin-top: 8px; }
    .m-chart svg { width: 100%; height: 30px; }

    /* ===== Features (Why / AI) ===== */
    .features { padding: 70px 0; background: #fff; }
    .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 30px; }
    .compare-card { background: #f8fafc; border-radius: 14px; padding: 26px; }
    .compare-title { font-size: 1.4rem; margin: 0 0 22px; text-align: center; }
    .compare-grid { display: grid; grid-template-columns: 1fr auto 1fr; gap: 18px; align-items: start; }
    .cc-head { font-weight: 700; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; margin-bottom: 12px; }
    .cc-head.zv { color: #22C55E; border-color: #22C55E; }
    .cc-item { display: flex; gap: 8px; padding: 5px 0; font-size: .82rem; }
    .cc-item .x { color: #ef4444; font-weight: 800; }
    .cc-item .check { color: #22C55E; font-weight: 800; }
    .compare-vs { background: #fff; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #2196F3; box-shadow: 0 4px 10px rgba(0,0,0,.08); margin-top: 30px; }

    .ai-card { background: linear-gradient(135deg, #f0f9ff 0%, #fff 100%); border-radius: 14px; padding: 26px; position: relative; overflow: hidden; }
    .ai-title { font-size: 1.4rem; margin: 0 0 22px; }
    .ai-feat { display: flex; gap: 14px; padding: 10px 0; }
    .ai-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1rem; flex-shrink: 0; }
    .ai-feat h4 { margin: 0 0 2px; font-size: .9rem; }
    .ai-feat p { margin: 0; font-size: .78rem; color: #64748b; }
    .ai-visual { position: absolute; bottom: 20px; right: 20px; width: 110px; height: 110px; }
    .ai-chip { width: 90px; height: 90px; background: linear-gradient(135deg, #2196F3, #22C55E); border-radius: 18px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 1.5rem; box-shadow: 0 10px 30px rgba(33,150,243,.3); transform: rotate(-10deg); position: absolute; bottom: 0; right: 0; }

    .stats-security-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .stats-banner { background: linear-gradient(135deg, #2196F3 0%, #22C55E 100%); border-radius: 14px; padding: 26px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; color: #fff; }
    .sb-stat { text-align: center; }
    .sb-num { font-size: 2rem; font-weight: 800; }
    .sb-label { font-size: .72rem; opacity: .9; margin-top: 4px; }

    .security-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 26px; }
    .security-card h3 { margin: 0 0 18px; font-size: 1.15rem; text-align: center; }
    .sec-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; text-align: center; }
    .sec-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .sec-icon { width: 38px; height: 38px; border-radius: 50%; background: #f0fdf4; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #22C55E; }
    .sec-label { font-size: .7rem; color: #475569; font-weight: 600; }

    /* ===== Testimonials ===== */
    .testimonials { padding: 70px 0; background: #f8fafc; }
    .testimonial-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 24px; }
    .testi-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .testi-card { background: #fff; border-radius: 12px; padding: 18px; box-shadow: 0 2px 10px rgba(15,42,74,.05); }
    .quote { font-size: 2rem; color: #2196F3; line-height: 1; font-weight: 800; }
    .quote-text { font-size: .8rem; color: #475569; margin: 6px 0 14px; line-height: 1.5; }
    .testi-foot { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .testi-avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: .8rem; }
    .testi-name { font-weight: 700; font-size: .85rem; }
    .testi-role { font-size: .68rem; color: #94a3b8; }
    .testi-stars { color: #f59e0b; font-size: .75rem; letter-spacing: 2px; }

    .future-card { background: linear-gradient(135deg, #0f2a4a 0%, #22C55E 100%); border-radius: 14px; padding: 26px; color: #fff; display: flex; flex-direction: column; justify-content: center; }
    .future-card h3 { font-size: 1.4rem; margin: 0 0 18px; }
    .future-cta { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 22px; }
    .early-count { display: flex; align-items: center; gap: 12px; }
    .ec-num { font-size: 1.8rem; font-weight: 800; color: #22ff8a; }
    .ec-text { font-size: .75rem; line-height: 1.3; }
    .ec-avatars { display: flex; }
    .ec-av { display: inline-flex; width: 26px; height: 26px; background: rgba(255,255,255,.2); border-radius: 50%; align-items: center; justify-content: center; margin-left: -6px; border: 2px solid #fff; font-size: .7rem; }

    /* ===== Contact ===== */
    .contact { padding: 70px 0; background: linear-gradient(135deg, #0f2a4a 0%, #22C55E 100%); }
    .contact-grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: 36px; align-items: center; color: #fff; }
    .contact h2 { font-size: 1.8rem; margin: 0 0 12px; line-height: 1.3; }
    .contact-left p { font-size: .95rem; opacity: .9; line-height: 1.5; }
    .pulse svg { width: 100%; height: 50px; margin-top: 14px; }

    .contact-form { background: rgba(255,255,255,.05); border-radius: 14px; padding: 24px; backdrop-filter: blur(10px); }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .field { display: flex; flex-direction: column; gap: 5px; }
    .field.full { grid-column: 1/-1; }
    .field label { font-size: .75rem; opacity: .9; }
    .field input, .field select { padding: 11px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.08); color: #fff; font-size: .85rem; }
    .field input::placeholder { color: rgba(255,255,255,.5); }
    .field input:focus, .field select:focus { outline: none; border-color: #22C55E; }
    .field select option { color: #0f2a4a; }
    .success-msg { margin-top: 14px; padding: 12px; background: rgba(34,197,94,.2); border-radius: 8px; color: #d1fae5; font-size: .85rem; text-align: center; }

    /* ===== Footer ===== */
    .footer { background: #0f2a4a; color: #cbd5e1; padding: 50px 0 20px; }
    .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 1.3fr; gap: 24px; margin-bottom: 30px; }
    .footer .brand-text { color: #fff; }
    .footer .brand-name { color: #fff; }
    .footer .brand-tag { color: #94a3b8; }
    .f-blurb { font-size: .8rem; line-height: 1.6; margin-top: 14px; color: #94a3b8; }
    .f-col h4 { color: #fff; font-size: .9rem; margin: 0 0 14px; }
    .f-col a { display: block; font-size: .8rem; color: #cbd5e1; padding: 4px 0; cursor: pointer; transition: color .15s; }
    .f-col a:hover { color: #22C55E; }
    .subscribe p { font-size: .78rem; color: #94a3b8; margin: 0 0 10px; }
    .sub-row { display: flex; gap: 6px; }
    .sub-row input { flex: 1; padding: 9px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,.15); background: rgba(255,255,255,.05); color: #fff; font-size: .8rem; }
    .copy { border-top: 1px solid rgba(255,255,255,.08); padding-top: 18px; text-align: center; font-size: .75rem; color: #94a3b8; }

    /* ===== Responsive ===== */
    @media (max-width: 960px) {
      .nav-menu { display: none; position: absolute; top: 100%; left: 0; right: 0; background: #fff; flex-direction: column; padding: 16px; box-shadow: 0 4px 12px rgba(0,0,0,.08); gap: 8px; }
      .nav-menu.open { display: flex; }
      .hamburger { display: flex; }
      .nav-cta .btn-soft, .nav-cta .btn-ghost { display: none; }
      .hero-inner { grid-template-columns: 1fr; }
      .hero-title { font-size: 2.2rem; }
      .hero-features { grid-template-columns: repeat(2, 1fr); }
      .eco-diagram { grid-template-columns: 1fr; gap: 14px; }
      .eco-side .eco-card, .eco-side.left .eco-card, .eco-side.right .eco-card { justify-content: flex-start; text-align: left; }
      .eco-center { min-height: 200px; }
      .eco-lines { display: none; }
      .modules-grid { grid-template-columns: 1fr 1fr; }
      .features-grid, .stats-security-grid, .testimonial-grid, .contact-grid { grid-template-columns: 1fr; }
      .testi-cards { grid-template-columns: 1fr; }
      .footer-grid { grid-template-columns: 1fr 1fr; }
      .row-2 { grid-template-columns: 1fr; }
      .stats-banner, .sec-grid, .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .trust-stats { gap: 18px; }
      .ts-num { font-size: 1.4rem; }
    }
    @media (max-width: 540px) {
      .modules-grid, .footer-grid { grid-template-columns: 1fr; }
      .charts-row { grid-template-columns: 1fr; }
      .compare-grid { grid-template-columns: 1fr; }
      .compare-vs { margin: 8px auto; }
    }
  `]
})
export class LandingComponent {
  private router = inject(Router);

  scrolled = signal(false);
  menuOpen = signal(false);
  activeSection = signal('home');
  submitting = signal(false);
  successMsg = signal('');
  earlyCount = signal(217);
  subscribeEmail = '';

  form: WaitlistEntry = {
    hospitalName: '', fullName: '', email: '', phone: '', businessType: '', submittedAt: ''
  };

  heroFeatures = [
    { icon: '☁', title: 'Cloud Secure',  sub: 'Data Protection',  bg: 'linear-gradient(135deg,#2196F3,#1976D2)' },
    { icon: '⚙', title: 'AI Powered',    sub: 'Smart Automation', bg: 'linear-gradient(135deg,#22C55E,#16A34A)' },
    { icon: '⌂', title: 'Multi-Branch',  sub: 'Management',       bg: 'linear-gradient(135deg,#8B5CF6,#7C3AED)' },
    { icon: '📊', title: 'Real-time',    sub: 'Analytics',        bg: 'linear-gradient(135deg,#F59E0B,#D97706)' },
  ];

  kpis = [
    { label: 'Total Patients', iconText: '👥', value: '12,458', trend: '15% from last month', color: '#2196F3' },
    { label: 'Appointments',   iconText: '📅', value: '1,245',  trend: '10% from last month', color: '#22C55E' },
    { label: 'Lab Tests',      iconText: '🧪', value: '3,620',  trend: '12% from last month', color: '#F59E0B' },
    { label: 'Revenue',        iconText: '💵', value: '₹45,75,000', trend: '22% from last month', color: '#22C55E' },
  ];

  activities = [
    { color: '#2196F3', text: 'New patient John Doe registered',        time: '10:30 AM' },
    { color: '#22C55E', text: 'Lab report #1253 completed',             time: '11:15 AM' },
    { color: '#F59E0B', text: 'Payment received from Mary Smith',       time: '01:20 PM' },
    { color: '#8B5CF6', text: 'Appointment scheduled with Dr. Brown',   time: '03:50 PM' },
  ];

  trustStats = [
    { num: '120+',  label: 'Hospitals' },
    { num: '75+',   label: 'Laboratories' },
    { num: '250+',  label: 'Pharmacies' },
    { num: '10K+',  label: 'Users (Early Interest)' },
  ];

  ecoLeft = [
    { icon: '🏥', title: 'Hospitals',      desc: 'Manage departments, staff, billing & patients' },
    { icon: '🏪', title: 'Medical Stores', desc: 'Smart inventory & medicine management' },
    { icon: '🚚', title: 'Suppliers / Agencies', desc: 'Orders, stock & supply chain management' },
  ];
  ecoRight = [
    { icon: '🧪',     title: 'Laboratories', desc: 'Test management, reports & analytics' },
    { icon: '👨‍⚕️', title: 'Doctors',      desc: 'Appointments, prescriptions & patient care' },
    { icon: '👥',     title: 'Patients',     desc: 'Book appointments, reports & prescriptions' },
  ];

  modules = [
    { icon: '🏥', iconBg: 'linear-gradient(135deg,#2196F3,#1976D2)', title: 'Hospital Administration', desc: 'OPD, IPD, appointments, billing, HR, payroll & more.', previewBg: '#eff6ff', dotColor: '#2196F3', rows: [1,2,3], hasChart: true },
    { icon: '🧪', iconBg: 'linear-gradient(135deg,#06B6D4,#0891B2)', title: 'Laboratory Management',   desc: 'Test workflow, reports, barcoding & analytics.',       previewBg: '#ecfeff', dotColor: '#06B6D4', rows: [1,2,3,4], hasChart: false },
    { icon: '💊', iconBg: 'linear-gradient(135deg,#22C55E,#16A34A)', title: 'Pharmacy Management',     desc: 'Inventory, medicine billing, expiry alerts & more.',  previewBg: '#f0fdf4', dotColor: '#22C55E', rows: [1,2,3,4], hasChart: false },
    { icon: '🚚', iconBg: 'linear-gradient(135deg,#F59E0B,#D97706)', title: 'Supplier Management',     desc: 'Product listings, orders, quotations & tracking.',    previewBg: '#fffbeb', dotColor: '#F59E0B', rows: [1,2,3,4], hasChart: false },
    { icon: '👤', iconBg: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', title: 'Patient Portal',          desc: 'Appointments, reports, prescriptions & payments.',    previewBg: '#faf5ff', dotColor: '#8B5CF6', rows: [1,2,3], hasChart: false },
    { icon: '📈', iconBg: 'linear-gradient(135deg,#EC4899,#DB2777)', title: 'Analytics & Reports',     desc: 'Real-time insights for better decisions.',            previewBg: '#fdf2f8', dotColor: '#EC4899', rows: [1,2], hasChart: true },
  ];

  traditionalPoints = [
    'Multiple disconnected software',
    'Manual processes & paperwork',
    'Data silos & integration issues',
    'Limited reporting & insights',
    'High operational costs',
    'Outdated user experience',
  ];
  zyvraaPoints = [
    'All-in-one integrated ecosystem',
    'Smart automation & workflows',
    'Connected data & real-time sync',
    'Advanced analytics & dashboards',
    'Lower costs, higher efficiency',
    'Modern, intuitive & easy to use',
  ];

  aiFeatures = [
    { icon: '📊', bg: 'linear-gradient(135deg,#2196F3,#1976D2)', title: 'AI Analytics & Insights',   desc: 'Make smarter decisions with data.' },
    { icon: '📦', bg: 'linear-gradient(135deg,#22C55E,#16A34A)', title: 'Smart Inventory Prediction', desc: 'Never run out of medicines again.' },
    { icon: '🔔', bg: 'linear-gradient(135deg,#F59E0B,#D97706)', title: 'Automated Reminders',        desc: 'Appointments, follow-ups & alerts.' },
    { icon: '💬', bg: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', title: 'AI Chatbot Support',         desc: 'Instant help for your patients & staff.' },
  ];

  bannerStats = [
    { num: '60%',  label: 'Faster Administration' },
    { num: '80%',  label: 'Less Manual Work' },
    { num: '3X',   label: 'Better Operational Visibility' },
    { num: '24/7', label: 'Cloud Access from Anywhere' },
  ];

  security = [
    { icon: '🔒', label: 'Data Encryption' },
    { icon: '🛡', label: 'Role Based Access' },
    { icon: '☁', label: 'Secure Cloud Infrastructure' },
    { icon: '🔄', label: 'Regular Backup & Recovery' },
  ];

  testimonials = [
    { initials: 'RS', name: 'Dr. Rajesh Sharma', role: 'Hospital Director', color: '#2196F3', quote: 'ZYVRAA will transform the way we manage our hospital operations.' },
    { initials: 'NV', name: 'Dr. Neha Verma',    role: 'Lab Director',      color: '#EC4899', quote: 'A complete ecosystem that connects labs, hospitals & patients seamlessly.' },
    { initials: 'AP', name: 'Amit Patel',         role: 'Pharmacy Manager',  color: '#22C55E', quote: 'Finally, a platform that understands pharmacies and inventory deeply.' },
  ];

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 30);
    const sections = ['home', 'features', 'modules', 'ecosystem', 'about', 'contact'];
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.top <= 120 && r.bottom > 120) {
          this.activeSection.set(id);
          break;
        }
      }
    }
  }

  scrollTo(id: string) {
    this.menuOpen.set(false);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  selectModule(i: number) {
    // Could open a detail modal; here we scroll to features for now
    this.scrollTo('features');
  }

  goLogin() {
    this.router.navigate(['/login']);
  }

  submitForm() {
    if (!this.form.hospitalName || !this.form.fullName || !this.form.email || !this.form.phone || !this.form.businessType) {
      this.successMsg.set('Please fill in all fields.');
      return;
    }
    this.submitting.set(true);
    this.form.submittedAt = new Date().toISOString();

    // Persist locally; in production this would hit an API
    const existing = JSON.parse(localStorage.getItem('zyvraa.waitlist') || '[]');
    existing.push({ ...this.form });
    localStorage.setItem('zyvraa.waitlist', JSON.stringify(existing));

    setTimeout(() => {
      this.submitting.set(false);
      this.successMsg.set(`Thank you, ${this.form.fullName}! You're on the waitlist. We'll be in touch shortly.`);
      this.earlyCount.update(n => n + 1);
      this.form = { hospitalName: '', fullName: '', email: '', phone: '', businessType: '', submittedAt: '' };
      setTimeout(() => this.successMsg.set(''), 6000);
    }, 700);
  }

  subscribe() {
    if (!this.subscribeEmail || !this.subscribeEmail.includes('@')) {
      alert('Please enter a valid email.');
      return;
    }
    const subs = JSON.parse(localStorage.getItem('zyvraa.subscribers') || '[]');
    subs.push({ email: this.subscribeEmail, at: new Date().toISOString() });
    localStorage.setItem('zyvraa.subscribers', JSON.stringify(subs));
    this.subscribeEmail = '';
    alert('Thanks for subscribing! You\'ll receive updates soon.');
  }
}

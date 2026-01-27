<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VantagePoint AI | Smart Inventory</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="Vantage.css">
</head>
<body>
    <nav class="navbar">
        <div class="container nav-container">
            <div class="logo"><i class="fa-solid fa-v"></i> VantagePoint AI</div>
            <ul class="nav-links">
                <li><a href="#">Features</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Testimonials</a></li>
            </ul>
            <a href="#" class="btn-signup">Sign Up</a>
        </div>
    </nav>

    <header class="hero">
        <div class="hero-bg-image"></div> <div class="hero-overlay">
            <div class="container hero-grid">
                <div class="hero-text">
                    <h1 class="main-title">STOP GUESSING,<br><span>START GROWING</span></h1>
                    <p class="subtitle-box">Predict inventory, maximize profit</p>
                    <a href="#" class="btn-trial">Start Your Free 14-Day Trial</a>
                    
                    <div class="features-summary">
                        <h3>Features That Drive Success</h3>
                        <div class="feature-row">
                            <div class="feature-mini">
                                <i class="fa-solid fa-bell"></i>
                                <p><strong>Real-Time Stock Alerts</strong><br>Arrive yet still by limit</p>
                            </div>
                            <div class="feature-mini">
                                <i class="fa-solid fa-gear"></i>
                                <p><strong>Automated Smart Ordering</strong><br>Analyze results daily</p>
                            </div>
                            <div class="feature-mini">
                                <i class="fa-solid fa-shoe-prints"></i>
                                <p><strong>Customer Heatmaps</strong><br>Foot-traffic insights</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="hero-visuals">
                    <div class="floating-card card-main">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQ2T3VlnOoeLzEIGNOgsMJB-fspH39qf83BQ&s" alt="Dashboard">
                    </div>
                    <div class="floating-card card-secondary">
                        <img src="https://www.dundas.com/support/images/dbi/docs/design/responsive-mode-example-iphone.png" alt="Analytics">
                    </div>
                </div>
            </div>
        </div>
    </header>

    <section class="social-proof">
        <div class="container">
            <p>Trusted by Local Businesses</p>
            <div class="logo-bar">
                <div class="client-logo">Boutique Bella</div>
                <div class="client-logo">Hardware Haven</div>
                <div class="client-logo">Daily Grind</div>
                <div class="client-logo">The Bookery</div>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <h2>Ready to Transform Your Business?</h2>
            <a href="#" class="btn-cta">Get Started Today</a>
            <div class="footer-bottom">
                <p>© 2024 VantagePoint AI</p>
                <div class="footer-links">
                    <a href="#">Terms of Service</a>
                    <a href="#">Privacy Policy</a>
                </div>
                <div class="social-icons">
                    <a href="#"><i class="fa-brands fa-twitter"></i></a>
                    <a href="#"><i class="fa-brands fa-facebook"></i></a>
                    <a href="#"><i class="fa-brands fa-instagram"></i></a>
                </div>
            </div>
        </div>
    </footer>
</body>
</html>
<style>
  :root {
    --primary-teal: #50c8b0;
    --dark-blue: #112240;
    --light-blue: #4a90e2;
    --text-white: #ffffff;
    --bg-gray: #f4f7f9;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* --- Navigation --- */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    background: white;
}

.nav-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
}

.logo {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--dark-blue);
}

.logo i { color: var(--primary-teal); }

.nav-links {
    display: flex;
    list-style: none;
    gap: 30px;
}

.nav-links a {
    text-decoration: none;
    color: #555;
    font-weight: 600;
}

.btn-signup {
    background: var(--primary-teal);
    color: white;
    padding: 10px 25px;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
}

/* --- Hero Section --- */
.hero {
    position: relative;
    min-height: 80vh;
    color: white;
    overflow: hidden;
}

/* Simulated blurred shop background */
.hero-bg-image {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1500') center/cover;
    filter: brightness(0.7) blur(2px);
    z-index: -1;
}

.hero-overlay {
    background: linear-gradient(to bottom, rgba(17, 34, 64, 0.4), rgba(74, 144, 226, 0.8));
    padding: 80px 0;
}

.hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: center;
}

.main-title {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 20px;
}

.subtitle-box {
    background: var(--dark-blue);
    display: inline-block;
    padding: 8px 15px;
    border-radius: 4px;
    font-size: 1.2rem;
    margin-bottom: 30px;
}

.btn-trial {
    display: inline-block;
    background: var(--primary-teal);
    color: white;
    padding: 18px 35px;
    border-radius: 50px;
    font-weight: 800;
    text-decoration: none;
    font-size: 1.1rem;
    margin-bottom: 50px;
}

/* --- Features Inside Hero --- */
.features-summary h3 {
    margin-bottom: 20px;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.feature-row {
    display: flex;
    gap: 20px;
}

.feature-mini {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 0.85rem;
}

.feature-mini i {
    font-size: 1.2rem;
}

/* --- Floating Visuals --- */
.hero-visuals {
    position: relative;
    height: 400px;
}

.floating-card {
    background: white;
    padding: 10px;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    position: absolute;
}

.floating-card img {
    width: 100%;
    border-radius: 8px;
}

.card-main {
    width: 100%;
    top: 0;
    z-index: 2;
    transform: perspective(1000px) rotateY(-10deg);
}

.card-secondary {
    width: 60%;
    bottom: -20px;
    left: -40px;
    z-index: 3;
    transform: perspective(1000px) rotateY(5deg);
}

/* --- Social Proof --- */
.social-proof {
    background: var(--light-blue);
    padding: 40px 0;
    text-align: center;
    color: white;
}

.logo-bar {
    display: flex;
    justify-content: space-around;
    margin-top: 25px;
    flex-wrap: wrap;
    gap: 20px;
}

.client-logo {
    background: white;
    color: var(--dark-blue);
    padding: 15px 30px;
    font-weight: bold;
    border-radius: 8px;
}

/* --- Footer --- */
.footer {
    background: var(--dark-blue);
    color: white;
    padding: 80px 0 20px;
    text-align: center;
}

.btn-cta {
    display: inline-block;
    background: var(--primary-teal);
    color: white;
    padding: 15px 40px;
    border-radius: 50px;
    text-decoration: none;
    font-weight: bold;
    margin: 30px 0 60px;
}

.footer-bottom {
    border-top: 1px solid rgba(255,255,255,0.1);
    padding-top: 20px;
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
}

.footer-links a, .social-icons a {
    color: white;
    text-decoration: none;
    margin: 0 10px;
}
</style>

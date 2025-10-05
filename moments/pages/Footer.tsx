export const Footer = () => {
    return (
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and quote */}
          <div>
            <h2 className="text-lg font-semibold text-purple-400">MemoryLane</h2>
            <p className="mt-2 text-sm text-gray-400">
            MemoryLane are the molecules that make up eternity. – Neal A. Maxwell
            </p>
          </div>
  
          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Company</h3>
            <ul className="space-y-1 text-sm text-gray-400">
              <li><a href="/faqs" className="hover:text-white">Frequently Asked Questions</a></li>
              <li><a href="#" className="hover:text-white">Pricing</a></li>
              <li><a href="#" className="hover:text-white">How It Works</a></li>
            </ul>
          </div>
  
          <div>
            <h3 className="text-sm font-semibold mb-2">Help and Support</h3>
            <ul className="space-y-1 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Chat with Support</a></li>
            </ul>
          </div>
  
          <div>
            <h3 className="text-sm font-semibold mb-2">Legal</h3>
            <ul className="space-y-1 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
  
        {/* Bottom copyright */}
        <div className="text-center text-xs text-gray-500 mt-10">
          © 2025 Moments, Inc. All rights reserved.
        </div>
      </footer>
    );
  };
  
  export default Footer;
  
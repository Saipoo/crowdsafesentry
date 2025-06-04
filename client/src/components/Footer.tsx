import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Shield className="text-primary text-xl mr-2" />
              <span className="font-bold text-gray-900">CrowdSafe</span>
            </div>
            <p className="text-sm text-gray-600">AI-powered crowd safety platform for Bengaluru and beyond.</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-primary">Safety Guidelines</a></li>
              <li><a href="#" className="hover:text-primary">Event Submission</a></li>
              <li><a href="#" className="hover:text-primary">Emergency Contacts</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Emergency</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Police: <a href="tel:100" className="text-primary font-medium">100</a></li>
              <li>Ambulance: <a href="tel:108" className="text-primary font-medium">108</a></li>
              <li>Fire: <a href="tel:101" className="text-primary font-medium">101</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Language</h3>
            <div className="space-y-2">
              <button className="block text-sm text-gray-600 hover:text-primary">English</button>
              <button className="block text-sm text-gray-600 hover:text-primary">ಕನ್ನಡ (Kannada)</button>
              <button className="block text-sm text-gray-600 hover:text-primary">हिंदी (Hindi)</button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-500">© 2024 CrowdSafe Platform. Built for public safety in Bengaluru.</p>
        </div>
      </div>
    </footer>
  );
}

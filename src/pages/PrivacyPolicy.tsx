
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-3 bg-gray-800">
        <div className="flex items-center">
          <img src="/placeholder.svg" alt="Logo" width="100" />
          <Link to="/" className="text-white ml-2">CustomAcademy</Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4 flex-grow">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">About CustomAcademy</h2>
            <p className="text-gray-300">
              CustomAcademy is an online learning platform dedicated to providing high-quality educational content
              across a wide range of topics. Our mission is to make education accessible to everyone, everywhere.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-3">Our Team</h2>
            <p className="text-gray-300">
              Our team consists of passionate educators, developers, and content creators who are committed to creating
              the best learning experience for our users. We believe in continuous learning and strive to improve our
              platform based on user feedback.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-3">Privacy Commitment</h2>
            <p className="text-gray-300">
              We respect your privacy and are committed to protecting your personal data. This privacy policy will inform
              you about how we look after your personal data when you visit our website and tell you about your privacy rights
              and how the law protects you.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-3">Data We Collect</h2>
            <p className="text-gray-300">
              We collect and process your personal data only for the purpose of providing you with our services. This may
              include your name, email address, and payment information. We do not sell your data to third parties.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
            <p className="text-gray-300">
              If you have any questions about our privacy policy or how we handle your data, please contact us at
              support@customacademy.com.
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6">
        <div className="container mx-auto flex justify-between">
          <div className="flex items-center">
            <img src="/placeholder.svg" alt="Logo" className="w-12 h-auto mr-2" />
            <p>© 2025 CustomAcademy, Inc.</p>
          </div>

          <div className="flex items-center">
            <div className="px-4">
              <Link to="/" className="hover:text-white">Home</Link>
            </div>
            <div className="px-4">
              <Link to="#" className="hover:text-white">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;

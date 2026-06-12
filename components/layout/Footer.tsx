export default function Footer() {
    const currentYear = new Date().getFullYear();
    
    return (
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} WorkReport Dashboard. All rights reserved.
            </p>
           
          </div>
        </div>
      </footer>
    );
  }
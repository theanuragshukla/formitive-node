import { FileText } from "lucide-react";

const About = () => {
  const cards = [
    {
      title: "Security",
      content:
        "Wherever possible, we use encrypted connections to protect your data. We implement protocols to secure information transmitted between your device and our servers. This helps prevent unauthorized access, ensuring your data remains private and secure.",
    },
    {
      title: "Privacy",
      content:
        "Your data is only your data. Uploads are processed for field detection/placement and returned to your browser for local editing. We don't store any uploads and your editing is done locally and not stored anywhere.",
    },
    {
      title: "Terms of Service",
      content:
        "While we make every effort to build safe, secure, and private software, by using this tool you do so entirely at your own risk. We make no guarantees regarding security, privacy, or accuracy beyond our best efforts to fulfill what we described above",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-6 pt-8 md:px-16">
        {/* Hero Section */}
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            We do things a bit differently{" "}
            <span className="bg-gradient-to-r from-[#FFF3DB] to-[#FFDA8F] text-transparent bg-clip-text">
              here...
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-16">
            We want to build great software for the doers: Utilizing AI to get
            work done faster but still have full control to edit and refine the
            final product to get exactly what you want.
          </p>
        </div>

        <div>
          <h2 className="text-4xl font-bold mb-12">
            Terms and{" "}
            <span className="bg-gradient-to-r from-[#FFF3DB] to-[#FFDA8F] text-transparent bg-clip-text">
              Privacy Policy
            </span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div className="bg-white/10 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
                <p className="text-gray-300">{card.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 md:px-16 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileText className="w-6 h-6" />
          <span className="text-lg font-medium">Formitive</span>
        </div>
        <span className="text-gray-400">© Formitive 2025</span>
      </footer>
    </div>
  );
};

export default About;

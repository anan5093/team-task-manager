import { Mail, Linkedin, BookOpen, GraduationCap, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-slate-950/40 backdrop-blur-md border-t border-white/5 py-6 px-4 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
        
        {/* Left Section: Contact/Socials Part 1 */}
        <div className="flex items-center gap-6 order-2 md:order-1">
          <a
            href="mailto:anand.ar1806@gmail.com"
            className="flex items-center gap-2 hover:text-teal-400 transition-colors duration-200"
            title="Email Anand Raj"
          >
            <Mail size={16} />
            <span className="hidden sm:inline">anand.ar1806@gmail.com</span>
          </a>
          <a
            href="https://www.linkedin.com/in/anand-raj-006a41217/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-teal-400 transition-colors duration-200"
            title="LinkedIn Profile"
          >
            <Linkedin size={16} />
            <span className="hidden sm:inline">LinkedIn</span>
          </a>
        </div>

        {/* Middle Section: Creator Tag */}
        <div className="flex items-center gap-1.5 font-medium text-slate-300 order-1 md:order-2">
          <span>Created with</span>
          <Heart size={15} className="fill-red-500 text-red-500 animate-pulse" />
          <span>by</span>
          <span className="text-white hover:text-teal-400 transition-colors duration-200 font-semibold">
            Anand Raj
          </span>
        </div>

        {/* Right Section: References/Socials Part 2 */}
        <div className="flex items-center gap-6 order-3">
          <a
            href="https://medium.com/@anand.ar1806"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-teal-400 transition-colors duration-200"
            title="Medium Publications"
          >
            <BookOpen size={16} />
            <span className="hidden sm:inline">Medium</span>
          </a>
          <a
            href="https://scholar.google.com/citations?user=GaQiP4kAAAAJ&hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-teal-400 transition-colors duration-200"
            title="Google Scholar Profile"
          >
            <GraduationCap size={16} />
            <span className="hidden sm:inline">Google Scholar</span>
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

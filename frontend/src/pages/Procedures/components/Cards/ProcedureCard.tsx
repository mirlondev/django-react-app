import gsap from "gsap";
import { Eye, Clock, ChevronRight } from "lucide-react";
import { useRef, useEffect } from "react";

const ProcedureCard = ({ procedure, index }) => {
  const cardRef = useRef(null);
  const IconComponent = procedure.icon;
  console.log(procedure);

  useEffect(() => {
    const card = cardRef.current;

    // Animation d'apparition avec délai basé sur l'index
    gsap.fromTo(
      card,
      {
        y: 50,
        opacity: 0,
        scale: 0.9,
        rotationY: -15,
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        rotationY: 0,
        duration: 0.8,
        delay: index * 0.1,
        ease: "back.out(1.7)",
      }
    );

    // Animations au hover
    const handleMouseEnter = () => {
      gsap.to(card, {
        scale: 1.05,
        y: -5,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [index]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Facile":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Intermédiaire":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Avancé":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer transform-gpu"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div
              className={`w-12 h-12 ${procedure.color} rounded-lg flex items-center justify-center`}
            >
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Eye className="w-4 h-4 mr-1" />
              {procedure.views}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {procedure.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {procedure.description}
          </p>

          <div className="flex items-center justify-between mb-4">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                procedure.difficulty
              )}`}
            >
              {procedure.difficulty}
            </span>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              {procedure.reading_time}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
              {procedure.category}
            </span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </>
  );
};
export default ProcedureCard;

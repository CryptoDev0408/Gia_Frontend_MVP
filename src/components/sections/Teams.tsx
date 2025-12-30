import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Team = {
  id: number;
  name: string;
  role: string;
  section_title: string;
  description: string;
  image?: string;
  button_text?: string;
  button_link?: string;
};

export const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    const cachedTeams = localStorage.getItem("teamsData");
    if (cachedTeams) {
      setTeams(JSON.parse(cachedTeams));
      setLoading(false);
    }

    const fetchTeams = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_LARAVEL_BACKEND_URL}/api/team`);
        console.log("=========================================== ", res)
        setTeams(res.data || []);
        localStorage.setItem("teamsData", JSON.stringify(res.data || []));
      } catch (err) {
        console.error(err);
        setError("Failed to load team data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) return <div className="text-center text-white py-20">Loading teams...</div>;
  if (error) return <div className="text-center text-red-500 py-20">{error}</div>;
  if (!teams.length) return <div className="text-center text-white py-20">No team members found.</div>;

  return (
    <div id="team" className="max-w-7xl mx-auto relative z-10 mb-16">
      <div className="bg-gradient-to-r from-brand-secondary/10 to-brand-accent/10 rounded-2xl p-8 border-brand-secondary/20 backdrop-blur-sm">
        {teams.length > 0 && (
          <h2 className="text-3xl md:text-3xl text-gradient mb-6 leading-tight">
            {teams[0].section_title}
          </h2>
        )}

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-5 px-4">
              {teams.map((team) => (
                <motion.div
                  key={team.id}
                  className="flex-[0_0_80%] sm:flex-[0_0_45%] lg:flex-[0_0_24%] p-4 border rounded text-white bg-gray-900/50 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  {team.image && (
                    <img
                      src={team.image}
                      alt={team.name}
                      className="mb-2 w-full h-50 object-cover object-center rounded"
                    />
                  )}
                  <h3 className="text-sm font-semibold mb-1">{team.name}</h3>
                  <h4 className="text-xs font-medium mb-1 text-gray-400">{team.role}</h4>
                  <p className="text-[.65rem] text-gray-300 mb-2">{team.description}</p>
                  {team.button_link && (
                    <a
                      href={team.button_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition"
                    >
                      {team.button_text || "View"}
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Arrows */}
          <button
            onClick={scrollPrev}
            className="absolute top-1/2 -left-6 -translate-y-1/2 bg-gray-800/70 p-2 rounded-full hover:bg-gray-700 transition"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute top-1/2 -right-6 -translate-y-1/2 bg-gray-800/70 p-2 rounded-full hover:bg-gray-700 transition"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

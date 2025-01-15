const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

const topics = [
    "Art", "Astronomy", "Anthropology", "Architecture", "Artificial Intelligence", "Agriculture", "Algorithms", "Anatomy", "Archaeology", "Astrophysics", "Autonomy",
    "Biology", "Botany", "Business", "Biochemistry", "Buddhism", "Blockchain", "Behaviorism", "Bioethics", "Branding", "Big Data", "Biodiversity",
    "Chemistry", "Climate Change", "Computer Science", "Cryptography", "Cognitive Science", "Cosmology", "Cybersecurity", "Capitalism", "Creative Writing", "Conservation",
    "Democracy", "Data Science", "Design", "Digital Marketing", "Diplomacy", "Discrimination", "Development", "Drawing", "Dietetics", "Digital Transformation",
    "Economics", "Education", "Engineering", "Environmental Science", "Ethics", "Evolution", "Epistemology", "Entrepreneurship", "Ecology", "Energy",
    "Finance", "Feminism", "Film Studies", "Forensics", "Futurism", "Forestry", "French Literature", "Food Science", "Fine Arts", "Freedom of Speech",
    "Genetics", "Geography", "Geology", "Government", "Graphic Design", "Gender Studies", "Game Theory", "Globalization", "Greek Philosophy", "Geriatrics",
    "History", "Health", "Human Rights", "Horticulture", "Hydrology", "Hospitality", "Hypnosis", "Humanism", "Human Anatomy", "Higher Education",
    "Information Technology", "Innovation", "International Relations", "Industrial Design", "Investment", "Immunology", "Internet Culture", "Intellectual Property", "Infrastructure", "Identity Politics",
    "Journalism", "Jurisprudence", "Japanese Culture", "Jazz", "Justice", "Juvenile Law", "Jewish Philosophy", "Joint Ventures", "Jungian Psychology", "Judicial Systems",
    "Kinetics", "Knowledge Management", "Korean Culture", "Kinesiology", "Kindness", "Karate", "Key Performance Indicators", "Kabbalah", "Kitchen Design", "Knowledge Economy",
    "Literature", "Linguistics", "Law", "Logic", "Leadership", "Library Science", "Luxury Marketing", "Latin American Studies", "Life Sciences", "Local Governance",
    "Mathematics", "Marketing", "Medicine", "Metaphysics", "Music", "Machine Learning", "Microbiology", "Media Studies", "Management", "Mythology",
    "Neuroscience", "Nanotechnology", "Nutrition", "Nuclear Physics", "Nonprofit Management", "Narrative Studies", "Network Security", "Natural Sciences", "Numerical Analysis", "Nonviolence",
    "Oceanography", "Oncology", "Operations Management", "Organic Chemistry", "Organizational Behavior", "Orthopedics", "Optimization", "Object-Oriented Programming", "Ornithology", "Ophthalmology",
    "Philosophy", "Psychology", "Physics", "Political Science", "Photography", "Poetry", "Programming", "Public Health", "Personal Finance", "Paleontology",
    "Quantum Physics", "Quality Assurance", "Queer Studies", "Quaternary Geology", "Quantitative Research", "QuickBooks", "Quantum Computing", "Quranic Studies", "Quarantine Policies", "Questionnaires",
    "Robotics", "Religion", "Real Estate", "Radiology", "Renewable Energy", "Renaissance Art", "Research Methods", "Risk Management", "Russian Literature", "Retail Management",
    "Sociology", "Statistics", "Sustainability", "Software Engineering", "Sports Science", "Social Media", "Semantics", "Supply Chain Management", "Solar Energy", "Strategic Planning",
    "Theology", "Technology", "Tourism", "Taxonomy", "Teaching", "Translation Studies", "Transportation", "Textile Design", "Telecommunications", "Team Building",
    "Urban Planning", "UX Design", "Unemployment Studies", "Urban Sociology", "Utility Management", "Underwater Archaeology", "User Behavior", "Usability Testing", "Utopian Studies", "Urban Ecology",
    "Virology", "Veterinary Medicine", "Virtual Reality", "Visual Arts", "Value Engineering", "Venture Capital", "Vocal Training", "Volcanology", "Video Game Design", "Victorian Literature",
    "Writing", "Wildlife Conservation", "Web Development", "Water Resource Management", "Women's Studies", "Welding", "War Studies", "World History", "Wind Energy", "Workplace Psychology",
    "Xenophobia", "X-ray Imaging", "XML", "Xerography", "Xenobiology", "Xylophone Studies", "X-ray Crystallography", "Xenotransplantation", "X-ray Diffraction", "Xenology",
    "Yoga", "Youth Studies", "Yiddish Culture", "Youth Movements", "Yield Management", "Youth Leadership", "Yellow Journalism", "Yoga Therapy", "Yacht Design", "Year-Round Education",
    "Zoology", "Zoning Laws", "Zero Waste", "Zen Buddhism", "Zoroastrianism", "Zoom Culture", "Zeitgeist", "Zymology", "Zoonotic Diseases", "Zeolites"
];

(async () => {
    try {
        for (const topic of topics) {
            await pool.query(
                "INSERT INTO tags (name, category) VALUES ($1, 'topic') ON CONFLICT (name) DO NOTHING",
                [topic]
            );
        }
        console.log("All topics have been inserted successfully.");
    } catch (err) {
        console.error("Error inserting topics:", err);
    } finally {
        await pool.end();
    }
})();

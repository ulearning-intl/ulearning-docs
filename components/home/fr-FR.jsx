import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mt-6 mb-16">
          <h1 className="text-4xl font-bold text-gray-800">Documentation</h1>
          <p className="text-xl text-gray-600 mt-4">
          Explorez nos guides et exemples pour libérer tout le potentiel de 
          Éducation intelligente.
          </p>
          <div className="mt-8">
            <a
              href="https://www.youtube.com/@ulearningtechnologyinterna8883/featured"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-blue-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-700 transition-colors">
                Explorez les tutoriels vidéo
              </button>
            </a>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <h3 className="text-xl text-gray-800 font-semibold">
              ULearning LMS
            </h3>
            <ul className="mt-4 text-blue-600">
              <li className="mt-1 mb-1">
                <Link href="/ulearning/admin/overview">Administrateur</Link>
              </li>
              <li className="mt-1 mb-1">
                <Link href="/ulearning/teacher/overview">Professeur</Link>
              </li>
              <li className="mt-1 mb-1">
                <Link href="/ulearning/student/overview">Étudiant</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl text-gray-800 font-semibold">
              Salle de classe intelligente UClass
            </h3>
            <ul className="mt-4 text-blue-600">
              <li className="mt-1 mb-1">Administrateur</li>
              <li className="mt-1 mb-1">Instructeur</li>
              <li className="mt-1 mb-1">Apprenant</li>
              <li className="mt-1 mb-1">Toutes les caractéristiques</li>
              <li className="mt-1 mb-1">Meilleures pratiques</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl text-gray-800 font-semibold">
              Examen en ligne UTest
            </h3>
            <ul className="mt-4 text-blue-600">
              <li className="mt-1 mb-1">
                <Link href="/utest/teacher">Professeur</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="container  mt-12 mb-16">
          <h2 className="text-2xl font-bold text-gray-800 leading-tight mb-4">
            Nos solutions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
              <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                <svg
                  className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </div>
              <div>
                <a href="#" className="font-semibold text-gray-900">
                  Solution d'éducation intelligente Huawei-ULearning
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1  text-sm text-gray-600">
                Solution totale intégrée pour la transformation numérique de 
                Éducation{" "}
                </p>
              </div>
            </div>

            <div className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
              <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                <svg
                  className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
                  />
                </svg>
              </div>
              <div>
                <a href="#" className="font-semibold text-gray-900">
                  Enseignement supérieur
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  Libérez le pouvoir de l'enseignement supérieur.
                </p>
              </div>
            </div>
            <div className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
              <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                <svg
                  className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"
                  />
                </svg>
              </div>
              <div>
                <a href="#" className="font-semibold text-gray-900">
                  TVET Éducation et formation
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  Plateforme et contenu TVET pour plus de 20 industries
                </p>
              </div>
            </div>
            <div className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
              <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                <svg
                  className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33"
                  />
                </svg>
              </div>
              <div>
                <a href="#" className="font-semibold text-gray-900">
                  Éducation K12
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  Solution de classe intelligente pour l'éducation K12
                </p>
              </div>
            </div>
            <div className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
              <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                <svg
                  className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <div>
                <a href="#" className="font-semibold text-gray-900">
                  Solution de formation de l'industrie
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1  text-sm text-gray-600">
                Responsabiliser votre croissance professionnelle avec Ulearning Classroom 
                Et le contenu spécifique à l'industrie.
                </p>
              </div>
            </div>
            <div className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
              <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                <svg
                  className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </div>
              <div>
                <a href="#" className="font-semibold text-gray-900">
                  Académie des TIC
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  Construisez votre académie des TIC avec Ulearning et HuaWei
                </p>
              </div>
            </div>

            <div className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
              <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                <svg
                  className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </div>
              <div>
                <a href="#" className="font-semibold text-gray-900">
                  Nuage de contenu
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                 Référentiel d'apprentissage Ulearning : Conduire la transformation numérique 
                 Dans l'éducation.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto mt-12 mb-16">
          <h2 className="text-2xl font-bold text-gray-800 leading-tight mb-4">
            Meilleures pratiques
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
              <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                <svg
                  className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
                  />
                </svg>
              </div>
              <div>
                <a href="#" className="font-semibold text-gray-800">
                  Guide de migration
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  Migration transparente vers Ulearning LMS : étapes faciles à suivre.
                </p>
              </div>
            </div>
            <div className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
              <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                <svg
                  className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"
                  />
                </svg>
              </div>
              <div>
                <a href="#" className="font-semibold text-gray-800">
                  Préparer le nouveau semestre
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  Préparez-vous pour votre prochain trimestre académique sans effort
                </p>
              </div>
            </div>
            <div className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
              <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                <svg
                  className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33"
                  />
                </svg>
              </div>
              <div>
                <a href="#" className="font-semibold text-gray-800">
                  Salle de classe 5E avec UClass
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  Stimuler la vitalité et l'énergie dans votre salle de classe
                </p>
              </div>
            </div>
            <div className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
              <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                <svg
                  className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <div>
                <a href="#" className="font-semibold text-gray-800">
                  Préparer Un Examen À Grande Échelle
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  Organisez un examen à grande échelle à l'aide d'Utest.
                </p>
              </div>
            </div>
            <div className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
              <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                <svg
                  className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </div>
              <div>
                <a href="#" className="font-semibold text-gray-800">
                  Pratique de la numérisation du contenu
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  Accumuler du contenu numérique avec qualité et quantité
                </p>
              </div>
            </div>

            <div className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
              <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                <svg
                  className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </div>
              <div>
                <a href="#" className="font-semibold text-gray-800">
                  Formation transnationale à la TVET
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  Meilleures pratiques pour la formation transnationale à l'ETVT
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-40 blue-links max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-800 leading-tight mb-4">
            Journal des modifications
          </h2>

          <div className="max-w-3xl">
            <div className="flex items-start border-b border-gray-300 pb-4 mt-4 mb-8">
              <div className="text-sm text-gray-600 w-32 mt-1">
                Oct. 25, 2023
              </div>
              <div className="flex-1 ml-8">
                <div className="text-lg font-semibold mb-2">
                  Ulearning Release 202312
                </div>
                <ul className="list-disc text-sm pl-4 text-gray-600">
                  <li>
                    Ajout d'une nouvelle fonctionnalité : Notifications intelligentes pour améliorer l'utilisateur 
                    Engagement.
                  </li>
                  <li>
                    Performances et stabilité améliorées pour un utilisateur plus fluide 
                    Expérience.
                  </li>
                  <li>
                    Correction de bugs mineurs et amélioration de la fiabilité globale de l'application.
                  </li>
                  <li>
                    Interface utilisateur mise à jour avec un design rafraîchi et amélioré 
                    Accessibilité.
                  </li>
                </ul>
                <div className="text-sm text-blue-600 mt-2 ">
                  <a href="#" className="underline">
                    Guide de l'utilisateur
                  </a>
                  ,{" "}
                  <a href="#" className="underline">
                    Guide de mise à niveau
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-start border-b border-gray-300 pb-4 mt-4 mb-8">
              <div className="text-sm text-gray-600 w-32 mt-1">
                Oct. 25, 2023
              </div>
              <div className="flex-1 ml-8">
                <div className="text-lg font-semibold mb-2">
                  UClass Release202311 : ajouter la prise en charge de l'IA
                </div>
                <p className="text-sm mt-2 text-gray-600">
                  {" "} 
                  La plate-forme UClass a été enrichie de capacités d'IA, 
                  Renforcer les fonctionnalités d'apprentissage avancées. Expérience personnalisée 
                  Suggestions de contenu grâce à une IA intégrée 
                  Système de recommandation. Obtenez une rétroaction précise avec l'IA 
                  Outils d'évaluation. Profitez d'une expérience utilisateur améliorée avec 
                  Organisation intelligente du contenu pilotée par des algorithmes d'IA. 
                  Des tests rigoureux garantissent une intégration transparente des fonctionnalités d'IA.
                </p>
                <div className="text-sm text-blue-600 mt-2">
                  <a href="#" className="underline">
                    Guide de l'utilisateur
                  </a>
                  ,{" "}
                  <a href="#" className="underline">
                    Guide de mise à niveau
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

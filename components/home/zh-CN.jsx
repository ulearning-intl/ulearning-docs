import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mt-6 mb-16">
          <h1 className="text-4xl font-bold text-gray-800">
            Ulearning文档中心
          </h1>
          <p className="text-xl text-gray-600 mt-4">
            探索我们的指南和示例，解锁智能教育的全部潜力。
          </p>
          <div className="mt-8">
            <a
              href="https://www.youtube.com/@ulearningtechnologyinterna8883/featured"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-blue-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-700 transition-colors">
                探索视频教程
              </button>
            </a>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <h3 className="text-xl text-gray-800 font-semibold">
              ULearning 学习管理系统
            </h3>
            <ul className="mt-4 text-blue-600">
              <li className="mt-1 mb-1">
                <Link href="/ulearning/admin/overview">管理员</Link>
              </li>
              <li className="mt-1 mb-1">教师</li>
              <li className="mt-1 mb-1">学生</li>
              <li className="mt-1 mb-1">所有功能</li>
              <li className="mt-1 mb-1">最佳实践</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl text-gray-800 font-semibold">
              UClass 智慧教室
            </h3>
            <ul className="mt-4 text-blue-600">
              <li className="mt-1 mb-1">管理员</li>
              <li className="mt-1 mb-1">教师</li>
              <li className="mt-1 mb-1">学生</li>
              <li className="mt-1 mb-1">所有功能</li>
              <li className="mt-1 mb-1">最佳实践</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl text-gray-800 font-semibold">
              UTest 考试系统
            </h3>
            <ul className="mt-4 text-blue-600">
              <li className="mt-1 mb-1">管理员</li>
              <li className="mt-1 mb-1">教师</li>
              <li className="mt-1 mb-1">学生</li>
              <li className="mt-1 mb-1">所有功能</li>
              <li className="mt-1 mb-1">最佳实践</li>
            </ul>
          </div>
        </div>

        <div className="container  mt-12 mb-16">
          <h2 className="text-2xl font-bold text-gray-800 leading-tight mb-4">
            解决方案
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
                  华为-ULearning智慧教育解决方案
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1  text-sm text-gray-600">
                  整合教育数字转型的全方位解决方案
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
                  高等教育
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  释放高等教育的力量。
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
                  职业教育和培训
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  为20多个行业提供职业教育平台和内容
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
                  K12教育
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  K12教育的智慧课堂解决方案
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
                  行业培训解决方案
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1  text-sm text-gray-600">
                  利用Ulearning教室和行业特定内容赋能您的职业成长。
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
                  ICT学院
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  通过Ulearning和华为建立您的ICT学院
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
                  内容云
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  Ulearning学习资源库：推动教育的数字化转型。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto mt-12 mb-16">
          <h2 className="text-2xl font-bold text-gray-800 leading-tight mb-4">
            最佳实践
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
                  迁移指南
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  轻松迁移到ULearning LMS：易于操作的步骤
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
                  准备新学期
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  轻松为下一个学期做好准备
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
                  UClass的5E教室
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  激发课堂的活力和能量
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
                  大规模考试准备
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  使用Utest组织大规模考试。
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
                  内容数字化实践
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  积累高质量和大量的数字内容
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
                  跨国职业培训
                  <span className="absolute inset-0"></span>
                </a>
                <p className="mt-1 text-sm text-gray-600">
                  跨国职业培训的最佳实践
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-40 blue-links max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-800 leading-tight mb-4">
            变更日志
          </h2>

          <div className="max-w-3xl">
            <div className="flex items-start border-b border-gray-300 pb-4 mt-4 mb-8">
              <div className="text-sm text-gray-600 w-32 mt-1">
                2023年10月25日
              </div>
              <div className="flex-1 ml-8">
                <div className="text-lg font-semibold mb-2">
                  Ulearning 发布版本 202312
                </div>
                <ul className="list-disc text-sm pl-4 text-gray-600">
                  <li>新增功能：智能通知，提升用户参与度。</li>
                  <li>提高性能和稳定性，提供更流畅的用户体验。</li>
                  <li>修复了一些小错误，提升了应用的可靠性。</li>
                  <li>更新了用户界面，拥有焕然一新的设计和更好的可访问性。</li>
                </ul>
                <div className="text-sm text-blue-600 mt-2 ">
                  <a href="#" className="underline">
                    用户指南
                  </a>
                  ,{" "}
                  <a href="#" className="underline">
                    升级指南
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-start border-b border-gray-300 pb-4 mt-4 mb-8">
              <div className="text-sm text-gray-600 w-32 mt-1">
                2023年10月25日
              </div>
              <div className="flex-1 ml-8">
                <div className="text-lg font-semibold mb-2">
                  UClass 发布版本 202311：新增AI支持
                </div>
                <p className="text-sm mt-2 text-gray-600">
                  UClass平台已充实了AI功能，赋予了先进的学习功能。通过集成的AI推荐系统体验个性化的内容建议。通过基于AI的评估工具获得准确的反馈。通过AI算法驱动的智能内容组织，享受增强的用户体验。经过严格测试，确保AI功能的无缝集成。
                </p>
                <div className="text-sm text-blue-600 mt-2">
                  <a href="#" className="underline">
                    用户指南
                  </a>
                  ,{" "}
                  <a href="#" className="underline">
                    升级指南
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

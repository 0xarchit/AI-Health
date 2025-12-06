import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { count } from "drizzle-orm";

export default async function HealthPage() {
  try {
    const result = await db.select({ count: count() }).from(users);
    const userCount = result[0].count;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 font-sans bg-transparent">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Health Check
          </h1>
          <div className="space-y-2">
            <p className="text-green-600 dark:text-green-400 font-medium text-lg">
              db is healthy
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Total users currently:{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {userCount}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Health check failed:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 font-sans bg-transparent">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center border-l-4 border-red-500">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Health Check
          </h1>
          <p className="text-red-600 font-medium text-lg">db is unhealthy</p>
          <p className="text-gray-500 text-sm mt-2">
            Check server logs for details.
          </p>
        </div>
      </div>
    );
  }
}

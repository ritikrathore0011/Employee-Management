import React from 'react';

export default function EventsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Events & Celebrations</h1>

      {/* Upcoming Events */}
      <section className="mb-8 bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Company Events</h2>
        <ul className="space-y-4">
          {[
            { date: '2025-04-30', name: 'Quarterly Town Hall', desc: 'Company-wide meeting to share updates and celebrate wins.' },
            { date: '2025-05-15', name: 'Tech Talk: Future of AI', desc: 'Knowledge-sharing session with the tech team.' },
          ].map((event, i) => (
            <li key={i} className="p-4 border rounded-xl hover:bg-gray-50 transition">
              <div className="font-semibold text-blue-700">{event.date}</div>
              <div className="text-lg font-bold">{event.name}</div>
              <p className="text-sm text-gray-600">{event.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Birthdays & Anniversaries */}
      <section className="mb-8 grid grid-cols-2 gap-6">
        <div className="bg-pink-50 shadow rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">🎉 Birthdays This Month</h3>
          <ul className="text-sm space-y-2">
            <li>Aditi Sharma — April 24</li>
            <li>Rahul Mehta — April 28</li>
          </ul>
        </div>
        <div className="bg-yellow-50 shadow rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">🎊 Work Anniversaries</h3>
          <ul className="text-sm space-y-2">
            <li>Sneha Patel — 3 years on April 20</li>
            <li>Arjun Nair — 1 year on April 26</li>
          </ul>
        </div>
      </section>

      {/* Notifications / Reminders */}
      <section className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Reminders</h2>
        <ul className="text-sm list-disc pl-5 space-y-1">
          <li>Don’t forget to RSVP for the Town Hall by April 28.</li>
          <li>Update your team page before May 1.</li>
        </ul>
      </section>
    </div>
  );
}

export async function onRequest() {
    const ICS_URL = "https://rosehulman.campusgroups.com/ics?uid=0fbbd62b-209e-11ef-87cd-0e9dd4d3253d&type=group&eid=a44f624aa54c7db3426511b7bade6e2d";
  
    try {
      const response = await fetch(ICS_URL);
      const text = await response.text();
  
      const events = text.split("BEGIN:VEVENT").slice(1);
      const now = new Date();
  
      let upcomingTrips = [];
  
      for (const rawEvent of events) {
        const summaryMatch = rawEvent.match(/SUMMARY:(.+)/);
        const dtStartMatch = rawEvent.match(/DTSTART:(\d{8}T\d{6})Z?/);
        const urlMatch = rawEvent.match(/URL:(.+)/);
  
        if (!summaryMatch || !dtStartMatch || !urlMatch) continue;
  
        const title = summaryMatch[1].trim();
        const startString = dtStartMatch[1];
  
        const year = startString.slice(0, 4);
        const month = startString.slice(4, 6);
        const day = startString.slice(6, 8);
        const hour = startString.slice(9, 11);
        const minute = startString.slice(11, 13);
        const second = startString.slice(13, 15);
  
        const startDate = new Date(
          Date.UTC(year, month - 1, day, hour, minute, second)
        );
  
        if (
          title.includes("Climbing Club Weekly Trip") &&
          startDate > now
        ) {
          upcomingTrips.push({
            start: startDate,
            url: urlMatch[1].trim(),
          });
        }
      }
  
      upcomingTrips.sort((a, b) => a.start - b.start);
  
      if (upcomingTrips.length > 0) {
        return Response.redirect(upcomingTrips[0].url, 302);
      }
  
      return new Response(
        `
        <html>
          <body style="font-family: sans-serif; text-align:center; padding:50px;">
            <h2>There are no trips scheduled at the moment.</h2>
            <p>Check the Discord or reach out to a Climbing Club officer for more information.</p>
          </body>
        </html>
        `,
        { headers: { "Content-Type": "text/html" } }
      );
  
    } catch (err) {
      return new Response(
        `
        <html>
          <body style="font-family: sans-serif; text-align:center; padding:50px;">
            <h2>Unable to load trips right now.</h2>
            <p>Please try again later.</p>
          </body>
        </html>
        `,
        { headers: { "Content-Type": "text/html" } }
      );
    }
  }
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/apply" && request.method === "POST") {
      try {
        const formData = await request.formData();

        const fields = [
          ["First Name", "First Name"],
          ["Middle Name", "Middle Name"],
          ["Last Name", "Last Name"],
          ["Marital Status", "Marital Status"],
          ["Age", "Age"],
          ["Gender", "Gender"],
          ["Occupation", "Occupation"],
          ["Email", "Email"],
          ["Phone", "Phone"],
          ["Country", "Country"],
          ["State", "State"],
          ["City", "City"],
          ["House Address", "House Address"],
          ["Agreement", "Agreement"]
        ];

        const escapeHtml = (value) =>
          String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        let applicationHtml = `
          <h2>New Organization Enlightenment Application</h2>
          <p>A new application was submitted through the website.</p>
          <hr>
        `;

        for (const [label, key] of fields) {
          applicationHtml += `
            <p>
              <strong>${escapeHtml(label)}:</strong>
              ${escapeHtml(formData.get(key))}
            </p>
          `;
        }

        const applicantEmail = formData.get("Email");

        const resendResponse = await fetch(
          "https://api.resend.com/emails",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
              from: "Organization Enlightenment <onboarding@resend.dev>",
              to: ["greatiluminatiorganization@gmail.com"],
              subject: "New Organization Enlightenment Application",
              html: applicationHtml,
              reply_to: applicantEmail || undefined
            })
          }
        );

        const result = await resendResponse.json();

        if (!resendResponse.ok) {
          return new Response(
            JSON.stringify({
              success: false,
              error: result
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Application submitted successfully."
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};

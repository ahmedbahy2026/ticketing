import Link from 'next/link';

const LandingPage = ({ currentUser, tickets }) => {
  const ticketList = tickets?.map((ticket) => (
    <tr key={ticket.id}>
      <td>{ticket.title}</td>
      <td>{ticket.price}</td>
      <td>
        <Link href={`/tickets/${ticket.id}`}>View</Link>
      </td>
    </tr>
  ));

  return (
    <div>
      <h1>Tickets</h1>
      {tickets.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Price</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>{ticketList}</tbody>
        </table>
      ) : (
        <p>No tickets available</p>
      )}
    </div>
  );
};

LandingPage.getInitialProps = async (context) => {
  try {
    const buildClient = (await import('../api/build-client')).default;
    const client = buildClient(context);

    const { data } = await client.get('/api/tickets');
    return { tickets: data };
  } catch (error) {
    console.error('Error fetching tickets:', error.message);
    return { tickets: [] };
  }
};

export default LandingPage;

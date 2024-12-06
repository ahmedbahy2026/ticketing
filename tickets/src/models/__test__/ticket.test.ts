import { Ticket } from '../ticket';

it('Imeplement Optimistic Concurrency Control (OCC)', async () => {
  // Create an instance of Ticket
  const ticket = Ticket.build({ title: 'Windows', price: 40, userId: '124' });

  // Save the ticket to the database
  await ticket.save();

  // Fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // Make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 100 });
  secondInstance!.set({ price: 500 });

  // Save the first fetched ticket
  await firstInstance?.save();

  // Save the second fetched ticket and expect an error
  try {
    await secondInstance?.save();
  } catch (err) {
    return;
  }
  throw new Error('Should not reach this point');
});

it('Increment the version number on each save', async () => {
  const ticket = Ticket.build({ title: 'Concert', price: 40, userId: '124' });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);

  await ticket.save();
  expect(ticket.version).toEqual(3);
});

import nats from 'node-nats-streaming';
import { ticketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();

const stan = nats.connect('ticketing', 'ABC', {
  url: 'http://localhost:4222'
});

stan.on('connect', async () => {
  console.log('Publisher connected to NATS');
  const data = {
    id: '12f32lksjd23',
    title: 'concert',
    price: 230
  };

  const publisher = new ticketCreatedPublisher(stan);
  await publisher.publish(data);
});

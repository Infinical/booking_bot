import { Injectable } from '@nestjs/common';
import { MessageBird, hsmLanguages, initClient } from 'messagebird';

@Injectable()
export class BookingFlowService {
  private messagebird: MessageBird;

  constructor() {
    this.messagebird = initClient(process.env.MESSAGEBIRD_API_KEY);
  }

  async createWebhook() {
    const params = {
      events: ['message.created'],
      channelId: '3d206122-4d8c-4bb0-a701-2b8294cd57ac',
      url: 'https://whatsappbotquick-669d3a9dc608.herokuapp.com/booking-flow/create-webhook',
    };

    await this.messagebird.conversations.webhooks.create(
      params,
      function (err, response) {
        if (err) {
          return console.log(err);
        }
        console.log(response);
      },
    );
  }

  async getWebhooks() {
    return await this.messagebird.conversations.webhooks.list(
      100,
      0,
      function (err, response) {
        if (err) {
          return console.log(err);
        }
        console.log(response);
        return response;
      },
    );
  }

  async deleteWebhook(id) {
    return await this.messagebird.conversations.webhooks.delete(
      id,
      function (err, response) {
        if (err) {
          return console.log(err);
        }
        console.log(response);
        return response;
      },
    );
  }

  userSessions = {};

  async startWebhook(req, res) {
    console.log('Webhook received:');
    console.log(req.body);
    console.log(this.userSessions);
    const payload = req.body;
    const from = `+${payload.contact.msisdn}`;
    let message: string | undefined;

    if (typeof payload.message.content === 'string') {
      message = payload.message.content;
    } else if (typeof payload.message.content.text === 'string') {
      message = payload.message.content.text;
    }

    if (!this.userSessions[from]) {
      this.userSessions[from] = { step: 0 };
    }

    const userSession = this.userSessions[from];

    switch (userSession.step) {
      case 0:
        this.sendGreeting(from);
        userSession.step++;
        break;
      case 1:
        if (message && message === 'Book Ticket') {
          console.log(`Message>>>>>>>>>>>>>>>>>${message}`);
          this.sendInteractiveMessage(from, 'travelling_from');
          userSession.step++;
        }

        if (message && message === 'Get Help') {
          console.log(`Message>>>>>>>>>>>>>>>>>${message}`);
          this.sendTextMessage(
            from,
            'Please visit our website or contact customer support for assistance.',
          );
        }
        break;
      case 2:
        userSession.departure = message;
        console.log(`Message>>>>>>>>>>>>>>>>>${message}`);
        if (userSession.departure) {
          this.sendInteractiveMessage(from, 'travelling_to');
          userSession.step++;
        }
        break;
      case 3:
        userSession.destination = message;
        if (userSession.destination) {
          this.sendInteractiveMessage(from, 'travel_dates');
          userSession.step++;
        }
        break;
      case 4:
        if (message === 'Pick a Date') {
          this.sendTextMessage(
            from,
            'Please enter the date in YYYY-MM-DD format.',
          );
          userSession.step++;
        } else {
          userSession.date = message;
          if (userSession.date) {
            this.sendInteractiveMessage(from, 'passenger_number');
            userSession.step += 2;
          }
        }
        break;
      case 5:
        userSession.date = message;
        if (userSession.date) {
          this.sendInteractiveMessage(from, 'passenger_number');
          userSession.step++;
        }
        break;
      case 6:
        userSession.passengers = message;
        if (userSession.passengers) {
          this.sendInteractiveMessage(from, 'available_buses');
          userSession.step++;
        }
        break;
      case 7:
        userSession.bus = message;
        if (userSession.bus) {
          this.sendInteractiveMessage(from, 'confirmation_bus_selection');
          userSession.step++;
        }
        break;
      case 8:
        userSession.status = message;
        if (userSession.status == 'Confirm') {
          this.sendInteractiveMessage(from, 'payment');
          userSession.step++;
        }

        if (userSession.status === 'Cancel') {
          this.sendTextMessage(from, 'Booking cancelled.');
          delete this.userSessions[from];
        }
        break;
      case 9:
        userSession.paymentMethod = message;
        if (userSession.paymentMethod === 'Card') {
          this.sendTextMessage(
            from,
            'Please enter your credit card details to complete the payment.',
          );
          userSession.step++;
        }

        if (userSession.paymentMethod == 'Mpesa') {
          this.sendTextMessage(
            from,
            'Please enter your mpesa number to complete the payment..',
          );

          userSession.step++;
        }
        break;
      case 10:
        userSession.paymentDetails = message;
        if (userSession.paymentDetails) {
          this.confirmBooking(from, userSession);
          delete this.userSessions[from];
        }
        break;
      default:
        this.sendTextMessage(
          from,
          "Sorry, something went wrong. Please start again by typing 'Book a Ticket'.",
        );
        delete this.userSessions[from];
    }

    res.send('OK');
  }

  // Webhook endpoint

  sendGreeting(to) {
    this.sendInteractiveMessage(to, 'welcome_quickbus');
  }

  async sendInteractiveMessage(to, templateName, locale = 'en') {
    this.messagebird.conversations.send(
      {
        content: {
          hsm: {
            namespace: '3d206122-4d8c-4bb0-a701-2b8294cd57ac',
            language: {
              code: locale as hsmLanguages,
              policy: 'deterministic',
            },
            templateName: templateName,
            components: [],
          },
        },
        to: to,
        from: '3d206122-4d8c-4bb0-a701-2b8294cd57ac',
        type: 'hsm',
        reportUrl: '',
      },
      (err, response) => {
        if (err) {
          console.log(err);
        } else {
          console.log(response);
        }
      },
    );
  }

  async sendTextMessage(to, text) {
    this.messagebird.conversations.send(
      {
        to: to,
        from: '3d206122-4d8c-4bb0-a701-2b8294cd57ac',
        type: 'text',
        content: {
          text: text,
        },
        reportUrl: '',
      },
      (err, response) => {
        if (err) {
          console.log(err);
        } else {
          console.log(response);
        }
      },
    );
  }

  async confirmBooking(to, session) {
    const bookingDetails = `
    Booking Confirmed:
    Bus: ${session.bus}
    Departure: ${session.departure}
    Destination: ${session.destination}
    Date: ${session.date}
    Passengers: ${session.passengers}
    Payment Method: ${session.paymentMethod}
    `;
    this.sendTextMessage(to, bookingDetails);

    // Sending ticket via WhatsApp
    this.sendTextMessage(
      to,
      'Your ticket has been sent to you via WhatsApp. Have a safe journey!',
    );
  }
}

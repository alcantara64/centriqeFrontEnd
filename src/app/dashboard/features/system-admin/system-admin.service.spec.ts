import { TestBed } from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController
} from '@angular/common/http/testing';
import { SystemAdminService } from './system-admin.service';

describe('SystemAdminService', () => {
    // We declare the variables that we'll use for the Test Controller and for our Service
    let httpTestingController: HttpTestingController;
    let service: SystemAdminService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SystemAdminService],
            imports: [HttpClientTestingModule]
        });

        // We inject our service (which imports the HttpClient) and the Test Controller
        httpTestingController = TestBed.get(HttpTestingController);
        service = TestBed.get(SystemAdminService);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    // Angular default test added when you generate a service using the CLI
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('returned Observable should match the right message list', () => {
        const mockMessages = [
            {
                channel: "whatsApp",
                createdAt: "2020-12-21T16:03:01.073Z",
                externalData: { events: [], errorCode: null, errorMessage: null },
                from: "+14155238886",
                messageEvent: "5fe0c70b498a2d001113803f",
                status: "sent",
                tags: [],
                text: "This is a test WhatsApp to Frank.",
                to: "+4917656777458",
                updatedAt: "2020-12-21T16:03:01.073Z"
            },
            {
                channel: "sms",
                createdAt: "2020-12-21T16:03:00.076Z",
                externalData: { events: [], errorMessage: "SMS sending is disabled." },
                from: "+14155238886",
                messageEvent: "5fe0c70b498a2d001113803e",
                status: "disabled",
                tags: [],
                statusMessage: "Forbidden",
                text: "This is a test SMS to Frank.",
                to: "+4917656777458",
                updatedAt: "2020-12-21T16:03:00.076Z"
            }
        ];

        service.getMessagesList()
            .subscribe(messages => {
                expect(messages).toBeTruthy();
                // expect(messages[0].channel).toEqual('whatsApp');
                // expect(messages[0].status).toEqual('sent');
                // expect(messages[0].createdAt).toEqual('2020-12-21T16:03:01.073Z');

                // expect(messages[1].channel).toEqual('sms');
                // expect(messages[1].status).toEqual('disabled');
                // expect(messages[1].createdAt).toEqual('2020-12-21T16:03:00.076Z');
                // expect(messages[1].statusMessage).toEqual('Forbidden');
                // expect(messages[1].externalData.errorMessage).toEqual('SMS sending is disabled.');
            });

            // 'https://dev2.centriqe.com/api/v2/messages'
        const req = httpTestingController.expectOne(
            'https://app.dev.centriqe.com/api/v2/messages'
        );
        req.flush(mockMessages);
    });

    it('returned Observable should match the right message Events list', () => {
        const mockMessageEvents = [
            {
                campaign: "5fead7403190390013698d3b",
                createdAt: "2020-12-29T07:14:09.315Z",
                date: "2025-12-30T18:30:00.000Z",
                holdingOrg: "5fbe32ef4820320011e174a3",
                memberOrg: null,
                messageType: "template-scheduled",
                status: "pending",
                updatedAt: "2020-12-29T07:14:09.315Z"
            },
            {
                campaign: "5fead5d231903900136989a5",
                createdAt: "2020-12-29T07:08:02.761Z",
                date: "2025-12-30T18:30:00.000Z",
                holdingOrg: "5fbe32ef4820320011e174a3",
                memberOrg: null,
                messageType: "template-scheduled",
                status: "pending",
                updatedAt: "2020-12-29T07:08:02.761Z"
            }
        ];

        service.getMessageEventsList()
            .subscribe(messageEvents => {
                expect(messageEvents).toEqual(mockMessageEvents);

                // expect(messageEvents[0]).toEqual(mockMessageEvents[0]);

                // expect(messageEvents[0].date).toEqual('2025-12-30T18:30:00.000Z');
                // expect(messageEvents[0].messageType).toEqual('template-scheduled');
                // expect(messageEvents[0].status).toEqual('pending');

                // expect(messageEvents[1]).toEqual(mockMessageEvents[1]);

                // expect(messageEvents[1].date).toEqual('2025-12-30T18:30:00.000Z');
                // expect(messageEvents[1].messageType).toEqual('template-scheduled');
                // expect(messageEvents[1].status).toEqual('pending');
            });

            // 'https://dev2.centriqe.com/api/v2/messageEvents'
        const req = httpTestingController.expectOne(
            'https://app.dev.centriqe.com/api/v2/messageEvents'
        );
        req.flush(mockMessageEvents);
    });
});
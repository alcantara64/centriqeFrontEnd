import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule,
    HttpTestingController } from '@angular/common/http/testing';
import { EmailService } from './email.service';
import { environment } from 'src/environments/environment';

const BECKEND_URL = environment.apiUrlV1;
    describe('EmailService', () => {
        // We declare the variables that we'll use for the Test Controller and for our Service
        let httpTestingController: HttpTestingController;
        let service: EmailService;
        
        beforeEach(() => {
          TestBed.configureTestingModule({
            providers: [EmailService],
            imports: [HttpClientTestingModule]
          });
      
          // We inject our service (which imports the HttpClient) and the Test Controller
          httpTestingController = TestBed.get(HttpTestingController);
          service = TestBed.get(EmailService);
        });
      
        afterEach(() => {
          httpTestingController.verify();
        });
      
        // Angular default test added when you generate a service using the CLI
        it('should be created', () => {
          expect(service).toBeTruthy();
        });

        it('should sent an email', () => {
          // Arrange
          const backendUrl:string = 'https://app.dev.centriqe.com/api/v2/messageEvents/templateInteractive';
          // const backendUrl:string = `${BECKEND_URL}/messageEvents/templateInteractive`;

            const mockPostData = {
                templateId: '5fce8e681d466753c06bb553',
                customerIds: ['5fc0c8bd3532f100114cfaf5'],
            };
        
            service.sendEmail(mockPostData)
              .subscribe(response => {
                expect(response).toBeTruthy();
              });
            // Act
            // const req = httpTestingController.expectOne('https://dev2.centriqe.com/api/v2/emails/send');
            const req = httpTestingController.expectOne(backendUrl);
            // Assert
            expect(req.request.method).toEqual('POST');
        
            req.flush(mockPostData);
          });
      });
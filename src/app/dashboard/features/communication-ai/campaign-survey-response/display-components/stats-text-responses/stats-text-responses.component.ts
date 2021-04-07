/** 06042021 - Gaurav - JIRA-CA-339, init version: Update frontend with feature to show comments */
import { Component, Input, OnInit } from '@angular/core';
import { DataDomainConfig } from 'src/app/dashboard/shared/components/menu/constants.routes';
import { dotdotdot } from 'src/app/shared/util/common.util';
import { CommunicationAIService } from '../../../communication-ai.service';
import { ProcessSurveyResponse } from '../../process-survey-response/process-survey-response';

@Component({
  selector: 'app-stats-text-responses',
  templateUrl: './stats-text-responses.component.html',
  styleUrls: ['./stats-text-responses.component.css'],
})
export class StatsTextResponsesComponent implements OnInit {
  @Input() currentFeature!: DataDomainConfig;
  @Input() instance!: ProcessSurveyResponse;
  responseArray!: any;
  isLoading = false;
  dots = '';

  constructor(private _commAIService: CommunicationAIService) {}

  ngOnInit(): void {
    let cursor = 0;
    let int = setInterval(() => {
      this.dots = dotdotdot(cursor++, 3, '.');
      if (!this.isLoading) {
        clearInterval(int);
        // console.log('interval cleared');
      }
    }, 100);

    if (!this.instance.data?.textResponses) {
      this._setLoading(true);
      this._commAIService
        .getCampaignSurveyTextResponse(
          this.currentFeature,
          this.instance?.data?.textResponsePayload!
        )
        .subscribe(
          (response) => {
            console.log(this.instance.data?.textResponsePayload);
            console.log('campaign survey text', { response });

            this.responseArray =
              Array.isArray(response) && response?.length > 0
                ? response[0]?.comments
                : [];
            this.instance.setTextResponses(this.responseArray);
            this._setLoading(false);
          },
          (_) => {
            this._setLoading(false);
          }
        );
    } else {
      this.responseArray = this.instance.data.textResponses;
    }
  }

  private _setLoading(value: boolean) {
    this.instance.setDataFetching(value);
    this.isLoading = value;
  }
}

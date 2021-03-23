/** 08022021 - Gaurav - Init version: component for Progress-Bar */
import { Component } from '@angular/core';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css'],
})
export class LoadingComponent {
  constructor(public loadingService: LoadingService) {}
}

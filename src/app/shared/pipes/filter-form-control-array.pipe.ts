/** 17032021 - Gaurav - New shared pipe to filter form array control (abstract control) inside a template */
import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';

interface FilterFormControlArrayPipeArgs {
  codeToMatch: string;
  fieldName: string;
}

@Pipe({
  name: 'filterFormControlArray',
})
export class FilterFormControlArrayPipe implements PipeTransform {
  transform(
    formControlArray: AbstractControl[],
    args: FilterFormControlArrayPipeArgs
  ): AbstractControl[] {
    if (!formControlArray) return <AbstractControl[]>[];
    if (!args || !(Object.entries(args).length > 0)) return formControlArray;
    // console.log('FilterFormControlArrayPipe', { formControlArray }, { args });
    // console.log(
    //   'FilterFormControlArrayPipe: filtered',
    //   formControlArray.filter(
    //     (row) => row.value[args.fieldName] === args.codeToMatch
    //   )
    // );

    return formControlArray.filter(
      (row) => row.value[args.fieldName] === args.codeToMatch
    );
  }
}

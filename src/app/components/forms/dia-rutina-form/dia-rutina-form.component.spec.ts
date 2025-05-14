import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiaRutinaFormComponent } from './dia-rutina-form.component';

describe('DiaRutinaFormComponent', () => {
  let component: DiaRutinaFormComponent;
  let fixture: ComponentFixture<DiaRutinaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiaRutinaFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiaRutinaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroDiarioFormComponent } from './registro-diario-form.component';

describe('RegistroDiarioFormComponent', () => {
  let component: RegistroDiarioFormComponent;
  let fixture: ComponentFixture<RegistroDiarioFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroDiarioFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroDiarioFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroEjercicioFormComponent } from './registro-ejercicio-form.component';

describe('RegistroEjercicioFormComponent', () => {
  let component: RegistroEjercicioFormComponent;
  let fixture: ComponentFixture<RegistroEjercicioFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroEjercicioFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroEjercicioFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

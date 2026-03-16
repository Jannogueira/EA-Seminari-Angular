import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizacionDetail } from './organizacion-detail';

describe('OrganizacionDetail', () => {
  let component: OrganizacionDetail;
  let fixture: ComponentFixture<OrganizacionDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizacionDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizacionDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

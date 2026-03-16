import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrganizacionService } from '../services/organizacion.service';
import { UsuarioService } from '../services/usuario.service';
import { Organizacion } from '../models/organizacion.model';
import { Usuario } from '../models/usuario.model';

@Component({
  selector: 'app-organizacion-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './organizacion-detail.html',
  styleUrls: ['./organizacion-detail.css'],
})
export class OrganizacionDetail implements OnInit {
  organizacion: Organizacion | null = null;
  loading = true;
  errorMsg = '';
  
  // Agregar usuario form
  mostrarFormUsuario = false;
  usuarioForm!: FormGroup;
  usuariosDisponibles: Usuario[] = [];

  constructor(
    private route: ActivatedRoute,
    private organizacionService: OrganizacionService,
    private usuarioService: UsuarioService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.usuarioForm = this.fb.group({
      usuarioId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadOrganizacion(id);
      } else {
        this.errorMsg = 'No ID provided.';
        this.loading = false;
      }
    });
  }

  loadOrganizacion(id: string): void {
    this.loading = true;
    this.errorMsg = '';

    // Primera petición: Obtener los detalles básicos de la organización
    this.organizacionService.getOrganizacionById(id).subscribe({
      next: (org) => {
        this.organizacion = org;

        // Segunda petición: Obtener la lista de usuarios de la organización.
        this.organizacionService.getOrganizacionConUsuarios(id).subscribe({
          next: (usuarios: any) => {
             if(this.organizacion) {
               this.organizacion.usuarios = usuarios;
               
               // Tercera petición: Obtener TODOS los usuarios para filtrar los disponibles
               this.usuarioService.getUsuarios().subscribe({
                 next: (allUsers) => {
                   const inOrgIds = usuarios.map((u: any) => u._id);
                   this.usuariosDisponibles = allUsers.filter(u => !inOrgIds.includes(u._id));
                   this.loading = false;
                   this.cdr.detectChanges();
                 },
                 error: () => {
                   // Si falla obtener todos, omitimos silenciosamente
                   this.loading = false;
                   this.cdr.detectChanges();
                 }
               });
             } else {
               this.loading = false;
               this.cdr.detectChanges();
             }
          },
          error: () => {
             this.errorMsg = 'Error loading organization users.';
             this.loading = false;
             this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.errorMsg = 'Error loading organization.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  eliminarUsuario(usuario: Usuario): void {
    if(confirm(`¿Estás seguro de que deseas quitar al usuario ${usuario.name} de esta organizacion?`)) {
      this.usuarioService.updateUsuarioOrganizacion(usuario._id, null).subscribe({
        next: () => {
          if(this.organizacion && this.organizacion._id) {
            this.loadOrganizacion(this.organizacion._id);
          }
        },
        error: () => {
          alert('Error eliminando el usuario de la organizacion');
        }
      });
    }
  }

  toggleAddUsuario(): void {
    this.mostrarFormUsuario = !this.mostrarFormUsuario;
    if(!this.mostrarFormUsuario) {
      this.usuarioForm.reset({ usuarioId: '' });
    }
  }

  addUsuario(): void {
    if (this.usuarioForm.invalid || !this.organizacion) return;

    const selectedUserId = this.usuarioForm.value.usuarioId;
    const orgId = this.organizacion._id;

    this.usuarioService.updateUsuarioOrganizacion(selectedUserId, orgId).subscribe({
      next: () => {
        this.toggleAddUsuario();
        this.loadOrganizacion(orgId);
      },
      error: () => {
        alert('Error añadiendo el usuario a la organización');
      }
    });
  }
}

//
//  main.cpp
//  puppetWork
//
//  Created by bogo on 4/10/16.
//
//

#include <stdio.h>

#include "RigidMeshDeformer2D.h"

class DeformableMesh {
public:
	rmsmesh::TriangleMesh m_mesh;
	rmsmesh::TriangleMesh m_deformedMesh;

	rmsmesh::RigidMeshDeformer2D m_deformer;
	bool m_bConstraintsValid;

	std::set<unsigned int> m_vSelected;
	unsigned int m_nSelected;
};
std::vector<DeformableMesh> meshes;

void InitializeDeformedMesh();
void UpdateDeformedMesh();
void InvalidateConstraints();
void ValidateConstraints();

void InitializeDeformedMesh()
{
	meshes[0].m_deformedMesh.Clear();
	
	unsigned int nVerts = meshes[0].m_mesh.GetNumVertices();
	for ( unsigned int i = 0; i < nVerts; ++i ) {
		Wml::Vector3f vVertex;
		meshes[0].m_mesh.GetVertex(i, vVertex);
		meshes[0].m_deformedMesh.AppendVertexData(vVertex);
	}

	unsigned int nTris = meshes[0].m_mesh.GetNumTriangles();
	for ( unsigned int i = 0; i < nTris; ++i ) {
		unsigned int nTriangle[3];
		meshes[0].m_mesh.GetTriangle(i,nTriangle);
		meshes[0].m_deformedMesh.AppendTriangleData(nTriangle);
	}

	meshes[0].m_deformer.InitializeFromMesh( &meshes[0].m_mesh );
	InvalidateConstraints();
}



void UpdateDeformedMesh() 
{
	ValidateConstraints();
	meshes[0].m_deformer.UpdateDeformedMesh( &meshes[0].m_deformedMesh, true );
}


// deformer stuff
void InvalidateConstraints() 
{ 
	meshes[0].m_bConstraintsValid = false; 
}

void ValidateConstraints()
{
	if ( meshes[0].m_bConstraintsValid ) {
		return;
	}

	size_t nConstraints = meshes[0].m_vSelected.size();
	std::set<unsigned int>::iterator cur(meshes[0].m_vSelected.begin()), end(meshes[0].m_vSelected.end());
	while ( cur != end ) {
		unsigned int nVertex = *cur++;
		Wml::Vector3f vVertex;
		meshes[0].m_deformedMesh.GetVertex( nVertex, vVertex);
		meshes[0].m_deformer.SetDeformedHandle( nVertex, Wml::Vector2f( vVertex.X(), vVertex.Y() ) );
	}

	meshes[0].m_deformer.ForceValidation();

	meshes[0].m_bConstraintsValid = true;
}

extern "C" {
	int resetMesh(void) {
		DeformableMesh newMesh;
		meshes.push_back(newMesh);
		meshes[0].m_mesh.Clear();
		return 1;
	}

	int setMeshVertexData(float *arr, int length) {
		for (int i = 0; i <  length; i+=2) {
			Wml::Vector3f vVert(arr[i], arr[i+1], 0);
			meshes[0].m_mesh.AppendVertexData( vVert );
		}
		return 1;
	}

	int setMeshTriangleData(float *arr, int length) {
		for (int i = 0; i < length; i+=3) {

			unsigned int t1 = arr[i];
			unsigned int t2 = arr[i+1];
			unsigned int t3 = arr[i+2];

			unsigned int nTri[3] = { t1, t2, t3 };
			meshes[0].m_mesh.AppendTriangleData( nTri );

		}
		return 1;
	}

	int getMeshVertexData(float *arr, int length) {
		for(int i = 0; i < length/2; i++) {
			Wml::Vector3f vert;
			meshes[0].m_deformedMesh.GetVertex(i, vert);

			arr[i*2] = vert.X();
			arr[i*2+1] = vert.Y();
		}

		return 1;
	}

	int getMeshTriangleData(float *arr, int length) {
		for (int i = 0; i < length; i+=3) {
			unsigned int nTriangle[3];
			meshes[0].m_mesh.GetTriangle(i/3,nTriangle);

			arr[i] = nTriangle[0];
			arr[i+1] = nTriangle[1];
			arr[i+2] = nTriangle[2];
		}
		return 1;
	}

	int setupMeshDeformer(void) {
		std::cout << "setup!\n";

		meshes[0].m_deformedMesh.Clear();
	
		unsigned int nVerts = meshes[0].m_mesh.GetNumVertices();
		for ( unsigned int i = 0; i < nVerts; ++i ) {
			Wml::Vector3f vVertex;
			meshes[0].m_mesh.GetVertex(i, vVertex);
			meshes[0].m_deformedMesh.AppendVertexData(vVertex);
		}

		unsigned int nTris = meshes[0].m_mesh.GetNumTriangles();
		for ( unsigned int i = 0; i < nTris; ++i ) {
			unsigned int nTriangle[3];
			meshes[0].m_mesh.GetTriangle(i,nTriangle);
			meshes[0].m_deformedMesh.AppendTriangleData(nTriangle);
		}

		meshes[0].m_deformer.InitializeFromMesh( &meshes[0].m_mesh );
		InvalidateConstraints();

		std::cout << "setup done!\n";

		return 1;
	}

	int addControlPoint(int index) {

		meshes[0].m_vSelected.insert(index);
		InvalidateConstraints();

		return 1;
	}

	int removeControlPoint(int index) {
		meshes[0].m_vSelected.erase(index);
		meshes[0].m_deformer.RemoveHandle(index);

		// restore position
		Wml::Vector3f vVertex;
		meshes[0].m_mesh.GetVertex(index, vVertex);
		meshes[0].m_deformedMesh.SetVertex(index, vVertex);

		return 1;
	}

	int setControlPointPosition(int index, float x, float y) {
		
		Wml::Vector3f vNewPos( x, y, 0.0f );
		meshes[0].m_deformedMesh.SetVertex( index, vNewPos );
		InvalidateConstraints();

		return 1;
	}

	int updateMeshDeformation(void) {

		UpdateDeformedMesh();

		return 1;
	}

}

int main() {
	std::cout << "deform2d: Looks like everything built correctly!\n";
}

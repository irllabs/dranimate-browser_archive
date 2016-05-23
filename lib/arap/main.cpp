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

void InitializeDeformedMesh(int meshIndex);
void UpdateDeformedMesh(int meshIndex);
void InvalidateConstraints(int meshIndex);
void ValidateConstraints(int meshIndex);

void InitializeDeformedMesh(int meshIndex)
{
	meshes[meshIndex].m_deformedMesh.Clear();
	
	unsigned int nVerts = meshes[meshIndex].m_mesh.GetNumVertices();
	for ( unsigned int i = 0; i < nVerts; ++i ) {
		Wml::Vector3f vVertex;
		meshes[meshIndex].m_mesh.GetVertex(i, vVertex);
		meshes[meshIndex].m_deformedMesh.AppendVertexData(vVertex);
	}

	unsigned int nTris = meshes[meshIndex].m_mesh.GetNumTriangles();
	for ( unsigned int i = 0; i < nTris; ++i ) {
		unsigned int nTriangle[3];
		meshes[meshIndex].m_mesh.GetTriangle(i,nTriangle);
		meshes[meshIndex].m_deformedMesh.AppendTriangleData(nTriangle);
	}

	meshes[meshIndex].m_deformer.InitializeFromMesh( &meshes[meshIndex].m_mesh );
	InvalidateConstraints(meshIndex);
}

void UpdateDeformedMesh(int meshIndex) 
{
	ValidateConstraints(meshIndex);
	meshes[meshIndex].m_deformer.UpdateDeformedMesh( &meshes[meshIndex].m_deformedMesh, true );
}

void InvalidateConstraints(int meshIndex) 
{ 
	meshes[meshIndex].m_bConstraintsValid = false; 
}

void ValidateConstraints(int meshIndex)
{
	if ( meshes[meshIndex].m_bConstraintsValid ) {
		return;
	}

	size_t nConstraints = meshes[meshIndex].m_vSelected.size();
	std::set<unsigned int>::iterator cur(meshes[meshIndex].m_vSelected.begin()), end(meshes[meshIndex].m_vSelected.end());
	while ( cur != end ) {
		unsigned int nVertex = *cur++;
		Wml::Vector3f vVertex;
		meshes[meshIndex].m_deformedMesh.GetVertex( nVertex, vVertex);
		meshes[meshIndex].m_deformer.SetDeformedHandle( nVertex, Wml::Vector2f( vVertex.X(), vVertex.Y() ) );
	}

	meshes[meshIndex].m_deformer.ForceValidation();

	meshes[meshIndex].m_bConstraintsValid = true;
}

extern "C" {
	int createNewMesh(void) {
		int newMeshIndex = meshes.size();

		DeformableMesh newMesh;
		meshes.push_back(newMesh);

		meshes[newMeshIndex].m_mesh.Clear();

		return newMeshIndex;
	}

	int setMeshVertexData(int meshIndex, float *arr, int length) {
		for (int i = 0; i < length; i+=2) {
			Wml::Vector3f vVert(arr[i], arr[i+1], 0);
			meshes[meshIndex].m_mesh.AppendVertexData( vVert );
		}
		return 1;
	}

	int setMeshTriangleData(int meshIndex, float *arr, int length) {
		for (int i = 0; i < length; i+=3) {

			unsigned int t1 = arr[i];
			unsigned int t2 = arr[i+1];
			unsigned int t3 = arr[i+2];

			unsigned int nTri[3] = { t1, t2, t3 };
			meshes[meshIndex].m_mesh.AppendTriangleData( nTri );

		}
		return 1;
	}

	int setupMeshDeformer(int meshIndex) {
		meshes[meshIndex].m_deformedMesh.Clear();
	
		unsigned int nVerts = meshes[meshIndex].m_mesh.GetNumVertices();
		for ( unsigned int i = 0; i < nVerts; ++i ) {
			Wml::Vector3f vVertex;
			meshes[meshIndex].m_mesh.GetVertex(i, vVertex);
			meshes[meshIndex].m_deformedMesh.AppendVertexData(vVertex);
		}

		unsigned int nTris = meshes[meshIndex].m_mesh.GetNumTriangles();
		for ( unsigned int i = 0; i < nTris; ++i ) {
			unsigned int nTriangle[3];
			meshes[meshIndex].m_mesh.GetTriangle(i,nTriangle);
			meshes[meshIndex].m_deformedMesh.AppendTriangleData(nTriangle);
		}

		meshes[meshIndex].m_deformer.InitializeFromMesh( &meshes[meshIndex].m_mesh );
		InvalidateConstraints(meshIndex);

		return 1;
	}

	int addControlPoint(int meshIndex, int controlPointIndex) {

		meshes[meshIndex].m_vSelected.insert(controlPointIndex);
		InvalidateConstraints(meshIndex);

		return 1;
	}

	int removeControlPoint(int meshIndex, int controlPointIndex) {

		meshes[meshIndex].m_vSelected.erase(controlPointIndex);
		meshes[meshIndex].m_deformer.RemoveHandle(controlPointIndex);

		// restore position
		Wml::Vector3f vVertex;
		meshes[meshIndex].m_mesh.GetVertex(controlPointIndex, vVertex);
		meshes[meshIndex].m_deformedMesh.SetVertex(controlPointIndex, vVertex);

		return 1;
	}

	int setControlPointPosition(int meshIndex, int controlPointIndex, float x, float y) {
		
		Wml::Vector3f vNewPos( x, y, 0.0f );
		meshes[meshIndex].m_deformedMesh.SetVertex( controlPointIndex, vNewPos );
		InvalidateConstraints(meshIndex);

		return 1;
	}

	int updateMeshDeformation(int meshIndex) {

		UpdateDeformedMesh(meshIndex);

		return 1;
	}

	int getMeshVertexData(int meshIndex, float *arr, int length) {
		for(int i = 0; i < length/2; i++) {
			Wml::Vector3f vert;
			meshes[meshIndex].m_deformedMesh.GetVertex(i, vert);

			arr[i*2] = vert.X();
			arr[i*2+1] = vert.Y();
		}

		return 1;
	}

}

int main() {
	std::cout << "deform2d: Looks like everything built correctly!\n";

	
}